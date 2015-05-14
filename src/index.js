

class Ajax {
	constructor(options) {
		this.isJsonp = options.isJsonp;

		if(this.isJsonp) {

			//TODO: Check a class inside another class
			class ScriptDOM {
				constructor (url) {
					this.head = document.getElementsByTagName('head')[0];
					this.script = document.createElement('script');
					this.script.type = 'text/javascript';
			    	this.script.src = url;
			    	this.head.appendChild(this.script);	
				}
				remove(){
					if (this.head.contains(this.script)) {
						this.head.removeChild(this.script);  
					}
				}
			}

			this.isJsonp = true;
			this.name = 'GeoPositionCallback';
	        this.requestCount = 0;
	        this.ScriptDOM = ScriptDOM;
	        this.fnName = options.callbackName || 'callback';
	        this.timeout = 3000;
		}
	};

	request(url, success, error) {
		if(this.isJsonp) {
			this.requestJSONP(url, success, error);
		} else  {
			this.requestHTTP(url, success, error);
		}
	}

	requestHTTP(url, callback, error) {
		let request = new XMLHttpRequest();
		request.open('GET', url, true);

		request.onreadystatechange = function() {
		  if (this.readyState === 4) {
		    if (this.status >= 200 && this.status < 400) {
		      let data = JSON.parse(this.responseText);
		      callback(data);
		    } else {
		      error();
		    }
		  }
		};

		request.send();
		request = null;
	}

	requestJSONP(url, callback, onError) {

        let callbackName = this.name + Date.now().toString() + Math.floor(Math.random() * 10000000).toString() + '_' + this.requestCount;

        this.requestCount++;

        // set callback function
        addExternal(callbackName, callbackReceived);

		// determine if there already are params
        url += (url.indexOf('?') + 1 ? '&' : '?');
        url += this.fnName + '=' + callbackName;

        // add to the DOM
		let script = new this.ScriptDOM(url);

		//to capture the error
		let timeId = setTimeout(abortJSONP, this.timeout);


		function abortJSONP () {
			script.remove();
			callback = false;
			onError();
		}

        function addExternal(name, fn) {
            window[name] = fn;
        }
        function removeExternal(name) {
        	if (window[name]) {
        		delete window[name];
        	}
        }
        function callbackReceived(data) {
            clearTimeout(timeId);
            // clean up
            script.remove();
            removeExternal(callbackName);

            // fire callback
            if (callback) {
                callback(data);
            }
        };
    }
}

class SourcesApi {
    constructor () {
        this.index = 0;
        this.sources = [
            {
                name: 'freegeoip',
                url: '//freegeoip.net/json/',
                country: 'country_name',
                timezone: 'time_zone',
                ajaxOptions : {
                	isJsonp : true,
                	callbackName : 'callback'
                }
            },
            {
                name: 'telize',
                url: '//www.telize.com/geoip',
                ajaxOptions : {
                	isJsonp : false
                }
            }
        ];
    };

    addSource(source) {
        this.sources.unshift(source);
    };

    getNext() {
        return this.sources[this.index++];
    };

    reset() {
    	this.index = 0;
    }
}

class Geoposition {

	constructor(callback, options) {
		this.sourcesApi = new SourcesApi();
		this.callback = callback;
		this.currentSource = false;
		this.currentData = null;

        options = options || {};

		//The built-in Utils.Ajax can be used or any other method
		//TODO: test if this would work with angular ajax and jQuery ajax
		this.Ajax = options.ajaxRequest || Ajax;
		this.isDefaultAjax = !options.ajaxRequest;

		//To add new sources withouth modifying the core
		if (options && options.sources) {
			//it is an array
			if(options.sources.length) {
				for (let i = options.sources.length - 1; i >= 0; i--) {
					this.sourcesApi.addSource(options.sources[i]);
				};
			//it is a simple source
			} else {
				this.sourcesApi.addSource(options.sources);
			}
		}

		this.getPosition();
	};

	getPosition() {

		this.currentSource = this.sourcesApi.getNext();;

		if (this.currentSource) {
			let ajax;

		    if (this.isDefaultAjax) {
					let ajax = new this.Ajax(this.currentSource.ajaxOptions);
					ajax.request(this.currentSource.url, onSuccess.bind(this), this.getPosition.bind(this));

				} else {
				    //jQuery methods
					let promise = this.Ajax(this.currentSource.url, onSuccess.bind(this));
					if (promise.fail) {
					    promise.fail(this.getPosition.bind(this));
					} else if (promise.error) {
					    promise.error(this.getPosition.bind(this));
					}
				}
		
		} else {
			log('There is no service available right now. Try later on;');
			this.sourcesApi.reset();
		}

		function onSuccess(data) {
			log('Data received from '+ this.currentSource.name);
			this.currentData = data;

			//because it is async, the API is created when the data is received
			this._createDataAPI();

			//The sources are reset in case the wants to call again to get position
			this.sourcesApi.reset();

			this.callback(data);

		}
	}

	//private method that can't be private
	 _createDataAPI () {
		this.getData = function (){
			return this.currentData;
		}

		this.getCity = function (){
			if(this.currentSource){
				let city = this.currentSource.city || 'city';
				return this.currentData[city];
			}
			return '';
		}

		this.getCountry = function () {
			if(this.currentSource){
				let country = this.currentSource.country || 'country';
				return this.currentData[country];
			}
			return '';
		}

		this.getCoordinates = function () {
			if(this.currentSource){
				let longitude = this.currentSource.longitude || 'longitude';
				let latitude = this.currentSource.latitude || 'latitude';
				return this.currentData[latitude] + ', '+ this.currentData[longitude];
			}
			return '';
		}
	}
};



function log(text) {
	console.log(text);
}

//main//
var geoPosition = new Geoposition(function() {
	var data = this.getData();
	var country = this.getCountry();
	var city = this.getCity();
	var coords = this.getCoordinates();

	country = '';
	console.log(data);
	console.log('Country = ' + country);
	console.log('City = ' + city);
	console.log('Coordinates = ' + coords);

	var text = ((country) ? 'Country = ' + country + '</br>' : '' ) + 
			   ((city) ? 'City = ' + city +  '</br>' : '' )+ 
			   ((coords)	?'Coordenates = ' + coords : '' );

	createElementDOM(text);
});

function createElementDOM(text) {
	var elem = document.createElement('div');
	elem.style.position= 'fixed';
	elem.style.background= 'white';
	elem.style.top= '20px';
	elem.style.left= '20px';
	elem.style.padding= '20px';
	elem.style.zIndex= '9999999999999999';
	elem.style.border= '1px solid black';
	elem.innerHTML = text;
	document.body.appendChild(elem);
}
