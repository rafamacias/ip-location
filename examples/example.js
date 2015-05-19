

var ipLocation = new IpLocation({
	logger: true
});

ipLocation.getPosition()
	.success(onPositionReceived)
	.error(function(){
		console.log('Error receiving Data. Try adding a new source with addSource')
	});


function onPositionReceived(data) {
	var data = this.getData();
	var country = this.getCountry();
	var city = this.getCity();
	var coords = this.getCoordinates();
	var timezone = this.getTimezone();

	//console.log(data);
	console.log('Country = ' + country);
	console.log('City = ' + city);
	console.log('Coordinates = ' + coords);
	console.log('TimeZone = ' + timezone);

	var text = (country ? 'Country = ' + country + '</br>' : '') + (city ? 'City = ' + city + '</br>' : '') + (coords ? 'Coordenates = ' + coords : '');

	//console.log(text);
	createElementDOM(text);
}

function createElementDOM(text) {
	var elem = document.createElement('div');
	elem.style.position = 'fixed';
	elem.style.background = 'white';
	elem.style.top = '200px';
	elem.style.left = '20px';
	elem.style.padding = '20px';
	elem.style.zIndex = '9999999999999999';
	elem.style.border = '1px solid black';
	elem.innerHTML = text;
	document.body.appendChild(elem);
}