# Ip-location

Find the location of the user based on the IP with different services.

Done in ES6 and brought to the browser with [Babeljs](http://babeljs.io/) and [Browserify](http://browserify.org/)

## Getting Started

`#: git clone git://github.com/coverflowjs/coverflow.git`

`#: cd coverflow`

`#: npm install`

`#: gulp build`

## USAGE

Add the file in `Dist` folder to your HTML

```html
  <script src="../dist/ip-location.js"></script>
  <script>
	var instance = new IpLocation();
	instance.getPosition()
		.success(function(data) {
			//Do something with the Data received.
			console.log(data);
		})
		.error(function() {
			console.log('No service available :-( ');
		});
  </script>
```

## Documentation

### API public methods

- getPosition()

 Looks for the current position. Returns the instance.

- success(callback)

 An asyncronous callback with the data received from the getPosition. Returns the instance.

- error(callback)

 Callback to execute if the services are not available. Returns the instance.


- addSource(sources)

 Allows to add new sources to the IpLocation after the instanstiation. Sources can be an object or an array of objects. Returns the instance.

```javascript
sources = {
	name: 'newService',
	url: 'www.url_of_new_service/receive_json'
}
```

#### API generated once the positions has been received. 

- getData()

- getCountry()

- getCity()

- getCoordinates()


### Options for the constructor
- logger (boolean) default false.

 If want to log to the console

- ajaxRequest (function)

 If want to add jQuery.getJSON for the Ajax requests

- sources (object)

 To add new sources on initialisation. These sources will be checked first.
```javascript
sources = {
	name: 'newService',
	url: 'www.url_of_new_service/receive_json'
}
```

## Examples

`#: gulp build`

`#: gulp webserver`

And then go to [examples](http://localhost:3000/examples/).
