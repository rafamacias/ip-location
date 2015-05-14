
class Ajax {
	constructor(options = {}) {
		this.isJsonp = options.isJsonp;

		if(this.isJsonp) {

			//TODO: Check a class inside another class
			class ScriptDOM {
				constructor (url) {
					this.head = document.getElementsByTagName('head')[0];
					this.script = document.createElement('script');
					this.script.type = 'text/javascript';
			    this.script.src = url;
				}
				
				add() {
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
	        this.timeout = 5000;
		}
	};
	request(url, success, error) {
		if(this.isJsonp) {
			this.requestJSONP(url, success, error);
		} else  {
			this.requestHTTP(url, success, error);
		}
	}

	requestHTTP(url, callback, onError) {
		let request = new XMLHttpRequest();
		request.open('GET', url, true);

		request.onreadystatechange = function() {
		  if (this.readyState === 4) {
		    if (this.status >= 200 && this.status < 400) {
		      let data = JSON.parse(this.responseText);
		      callback(data);
		    } else {
		      onError();
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

	  	// determine if there already are params and add the callcak parameter
        url += (url.indexOf('?') + 1 ? '&' : '?');
        url += this.fnName + '=' + callbackName;

        // add to the DOM
    		let script = new this.ScriptDOM(url);
    		script.add();
    
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
};

module.exports = Ajax;