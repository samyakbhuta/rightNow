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

//TODO : Need photo or avatar support.
//TODO : Unit testing
//TODO : Dummy Library with lots of factory method in it.
//TODO : WebAdmin:Let the config.json file be web editable.
//TODO : WebAdmin:Let the application instance start and stop using web interface.
//TODO : Have lot of console.out of debuggin, but let it spit only when we use NODE_ENV="development"

var geo = require("geo");
var nowjs=require("now");
var express = require("express");
var fs = require("fs");
var mongoose = require('mongoose');
var myModel = require("./updates").myModel;




/**
 * Define model.
 */

//mongoose.connect("mongodb://localhost/db");
mongoose.connect(process.env['DUOSTACK_DB_MONGODB']);

config = JSON.parse(fs.readFileSync('./config.json'));

/*
Default host and port ! This should be ideally specified using command line or config.json file. Default are here just in the case nothing is supplied.
*/
var HOST = config && config.host || "localhost";
var PORT = config && config.port || 1234;

/*
Default username and password ! This should be ideally specified using command line or config.json file. Default are here just in the case nothing is supplied.
*/
var USERNAME = config && config.username || "admin";
var SECRET = config && config.secret || "admin";
var NICK = config && config.usernick || "admin";
/*
Note: We are not putting current status data under everyone.now. We are relying on the function calls strictly as recommended by nowjs documentation. 
*/

var currentLocationName = "Not known";
var currentActivityMessage = "No updates, yet !";
var currentFormattedAddress = "";
var currentLng = "0.0";
var currentLat = "0.0";
var lastLocationUpdateTimestamp=+new Date();
var lastActivityMessageUpdateTimestamp=+new Date();

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
	httpServer.use(express.static(__dirname + '/public', { maxAge: "oneYear" }));
	
});

everyone.connected(function(){
	everyone.now.updateLocation( NICK + " <a href='http://www.google.com/#q="+currentFormattedAddress+"'>@"+currentLocationName+"</a>",currentActivityMessage);
});

/*
Example : example.com:1234/a/hacking the node.js
In this case the only data which has been changed is currentActivityMessage. Apart from that all data remains unchanged.
*/
httpServer.get("/update/a/:activityMessage",express.basicAuth(USERNAME,SECRET),function(req,res){	
	currentActivityMessage = req.params.activityMessage;
	lastActivityMessageUpdateTimestamp=+new Date();

	everyone.now.updateLocation( NICK + " <a href='http://www.google.com/#q="+currentFormattedAddress+"'>@"+currentLocationName+"</a>",currentActivityMessage);

	var anUpdateInstance = new myModel();
	anUpdateInstance.location = currentLocationName;
	anUpdateInstance.activity = currentActivityMessage;
	anUpdateInstance.timestamp = lastLocationUpdateTimestamp;
	console.log(anUpdateInstance);

	anUpdateInstance.save(function(err){
		if (err==null){
			console.log("Saved");
		}else {
			console.log("Couldn't save " + err);
		}
	});
	res.end();
});

/*
Example : example.com:1234/update/vadodara/hacking the node.js
Based on raw location name string we need to find out rest of the position details with geo code lookup.
We use "geo" module for the same.		
*/
httpServer.get("/update/:locationName/:activityMessage",express.basicAuth(USERNAME,SECRET),function(req,res){
	lastLocationUpdateTimestamp=lastActivityMessageUpdateTimestamp=+new Date();
	currentLocationName = req.params.locationName;
	currentActivityMessage = req.params.activityMessage;
	geo.geocoder(geo.google,req.params.locationName, false, function(formattedAddress, latitude, longitude) {
			currentFormattedAddress = formattedAddress;
			currentLng = latitude;
			currentLat = longitude;
			everyone.now.updateLocation( NICK + " <a href='http://www.google.com/#q="+currentFormattedAddress+"'>@"+currentLocationName+"</a>",currentActivityMessage);
			/*if (developmentMode)
			console.log("Formatted Address: " + formattedAddress);
			console.log("Latitude: " + latitude);
			console.log("Longitude: " + longitude);
			*/
		});

	var anUpdateInstance = new myModel();
	anUpdateInstance.location = currentLocationName;
	anUpdateInstance.activity = currentActivityMessage;
	anUpdateInstance.timestamp     = lastLocationUpdateTimestamp;
	console.log(anUpdateInstance);

	anUpdateInstance.save(function(err){
		if (err==null){
			console.log("Saved");
		}else {
			console.log("Couldn't save " + err);
		}
	});
	res.end();
});

httpServer.listen(PORT,HOST);
console.log("listening at http://" + HOST +":"+PORT);
