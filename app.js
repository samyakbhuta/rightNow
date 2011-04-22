/*
	Visually Speaking ...
	
	
							        |------>------Client1==>==Display It On Sceen	
							    	|-->----------Client2==>==Display It On Sceen	
	GET Request -------->----[node.js]----------->----------|---------->--Client3==>==Display It On Sceen
	+Authentication		 [+express.js]			|------->-----Client4==>==Display It On Sceen
				 [+now.js]			|---------->--Client5==>==Display It On Sceen

	GET Request could be
		1)Just location information
		"example.org:1234/update/vadodara"
		"example.org:1234/update/?lat=22_10_00_N&lng=71_18_01_E"
		2) With location and activity
		"example.org:1234/update/vadodara/mocha + node.js"
		"example.org:1234/update/mumbai/with friends for Kalaghoda Art Festival"
		3)
		"example.org:1234/update/a/mocha + node.js"
*/

//TODO : Need to store nameofRightNower(or broadcaster), lastUpdatedTimestamp, photo or avatar
//TODO : Unit testing
//TODO : Dummy Library with lots of factory method in it.
//TODO : Let default host and port be changed using command line arguments, or using config.json file.
//TODO : WebAdmin:Let the config.json file be web editable.
//TODO : WebAdmin:Let the application instance start and stop using web interface.
//TODO : Have lot of console.out of debuggin, but let it spit only when we use NODE_ENV="development"
//TODO : Have only activityMessage update possible.
//TODO : Provide authentication support.
//TODO : As soon as client is connected everyone.now.updateLocation() should be called.

var geo = require("geo");
var nowjs=require("now");
var express = require("express");

/*
Default host and port !
*/
var HOST = "localhost";
var PORT = 1234;
/*
Note: We are not putting current status data under everyone.now. We are relying on the function calls strictly as recommended by nowjs documentation. 
*/
var currentLocationName = "Not known";
var currentActivityMessage = "No updates, yet !";
var currentFormattedAddress = "";
var currentLng = "0.0";
var currentLat = "0.0";

var httpServer = express.createServer();
var everyone = nowjs.initialize(httpServer);

httpServer.configure(function(){
	httpServer.use(express.logger());
});

/*
Use $> node NODE_ENV='development' app.js to activate the development mode
Use $> node NODE_ENV='production' app.js to activate the production mode
*/
httpServer.configure("development",function(){
	httpServer.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	httpServer.use(express.static(__dirname + '/public'));
});
httpServer.configure("production",function(){
	httpServer.use(express.errorHandler());
	httpServer.use(express.static(__dirname + '/public', { maxAge: oneYear }));
});


everyone.connected(function(){
	everyone.now.updateLocation("<a href='http://www.google.com/#q="+currentFormattedAddress+"'>"+currentLocationName+"</a>",currentActivityMessage);
});

/*
Example : example.com:1234/a/hacking the node.js
In this case the only data which has been changed is currentActivityMessage. Apart from that all data remains unchanged.
*/
httpServer.get("/update/a/:activityMessage",function(req,res){	
	currentActivityMessage = req.params.activityMessage;
	everyone.now.updateLocation("<a href='http://www.google.com/#q="+currentFormattedAddress+"'>"+currentLocationName+"</a>",currentActivityMessage);
	res.end();
});

/*
Example : example.com:1234/update/vadodara/hacking the node.js
Based on raw location name string we need to find out rest of the position details with geo code lookup.
We use "geo" module for the same.		
*/
httpServer.get("/update/:locationName/:activityMessage",function(req,res){
	currentLocationName = req.params.locationName;
	currentActivityMessage = req.params.activityMessage;
	geo.geocoder(geo.google,req.params.locationName, false, function(formattedAddress, latitude, longitude) {
			currentFormattedAddress = formattedAddress;
			currentLng = latitude;
			currentLat = longitude;
			everyone.now.updateLocation("<a href='http://www.google.com/#q="+currentFormattedAddress+"'>"+currentLocationName+"</a>",currentActivityMessage);
			/*if (developmentMode)
			console.log("Formatted Address: " + formattedAddress);
			console.log("Latitude: " + latitude);
			console.log("Longitude: " + longitude);
			*/
		});
	res.end();
});

httpServer.listen(PORT,HOST);
console.log("listening at http://" + HOST +":"+PORT);

