import Ajax from "./Ajax";
import SourcesApi from "./SourcesApi";


class Geolocalization {
	constructor(options = {}) {
		this.logger = options.logger;

		this.sourcesApi = new SourcesApi();
		
		this.currentSource = false;

		this.hasFailed = false;
		this.hasSuccess = false;

		this.currentData = null;

		//The app can log to the normal console or to a custom function passed
		this.logger = options.logger;

		//The built-in Utils.Ajax can be used or any other method
		//TODO: test if this would work with angular ajax and jQuery ajax
		this.Ajax = options.ajaxRequest || Ajax;
		this.isDefaultAjax = !options.ajaxRequest;

		//To add new sources withouth modifying the core
		if (options.sources) {
			this.sourcesApi.addSource(options.sources);
		}
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
			this.hasFailed = true;
			this._log('There is no service available right now. Try later on;');
			this.sourcesApi.reset();
			if(this.onError) {
				this.onError();
			}
		}

		return this;

		function onSuccess(data) {
			this._log('Data received from '+ this.currentSource.name);
			this._log(data);

			this.currentData = data;

			//because it is async, the API is created when the data is received
			this._createDataAPI();

			//The sources are reset in case the wants to call again to get position
			this.sourcesApi.reset();

			this.hasSuccess = true;
			if(this.callback) {
				this.callback(data);	
				this.hasSuccess = false;
			}
		}
	}

	addSources(sources) {
		this.sourcesApi.addSource(sources);
		return this;
	}

	error (callback) {
		this.onError = callback;
		if(this.hasFailed) {
			callback();
		}
		return this;
	}

	success (callback) {
		this.callback = callback;
		if(this.hasSuccess && this.currentData) {
			callback(this.currentData);
		}
		return this;
	}

	//private method that can't be private
	_log(text) {
		if(this.logger) {
			this._log = function(text) {
				console.log(text);
			}
		} else {
			this._log = function() {};
		}
		return this._log(text);
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
		this.getTimezone = function () {
			if(this.currentSource){
				let timezone = this.currentSource.timezone || 'timezone';
				return this.currentData[timezone];
			}
			return '';
		}
	}
};
module.exports = Geolocalization;
