var express = require("express");
var httpServer = express.createServer();
var nowjs=require("now");
var everyone = nowjs.initialize(httpServer);
var geo = require("geo");

//everyone.connected();

/*
	Visually Speaking ...
	
	
							        |------>------Client1==>==Display It On Sceen	
							    	|-->----------Client2==>==Display It On Sceen	
	GET(lat,long)------->----[node.js]----------->----------|---------->--Client3==>==Display It On Sceen
	+Authentication		 [+express.js]			|------->-----Client4==>==Display It On Sceen
				 [+now.js]

*/

//TODO : Need to store nameofRightNower(or broadcaster), lastUpdatedTimestamp,
//TODO : Use GeoIP services.
//TODO : Update should have the W3C Position object support. as well as humanized 
//TODO : There are 
//TODO : example.com:1234/update/vadodara should work

httpServer.configure(function(){
	httpServer.use(express.logger());
});
httpServer.configure("development",function(){
	httpServer.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	httpServer.use(express.static(__dirname + '/public'));
});
httpServer.configure("production",function(){
	httpServer.use(express.errorHandler());
	httpServer.use(express.static(__dirname + '/public', { maxAge: oneYear }));
});


dummyCoords = "22_18_00_N_73_12_01_E";
dummyTimestamp = "123456";
dummyPosition = "Vadodara";
dummyPosition.type="City";
dummyPosition.activity="Hacking around node.js";
dummyPosition.coords = dummyCoords;
dummyPosition.timestamp = dummyTimestamp;

var setToGoogleGeoedLocation = function (formattedAddress,lat,lng){
	console.log("1 "+formattedAddress);
	console.log("2 "+lat);
	console.log("3 "+lng);
};


/*
As told in now.js documentation, it is better to share the data with the help of fuction.
So we would not like something like this. Thought it seems obvious to do.
everyone.now.currentPosition = dummyPosition;
For every update a client is notified by calling function updateLocation();
*/


/*
	Just kept for quick easy testing ...
	Example : example.com:1234/update
	Should use dummy/hard coded values.
*/

httpServer.get("/update",function(req,res){
	everyone.now.updateLocation(dummyPosition);
	res.end();
});

/*
	Example : example.com:1234/update/vadodara/hacking the node.js
	Based on raw location name string we need to find out rest of the position details with geo code lookup.
	We use "geo" module for the same.		
*/
httpServer.get("/update/:locationName/:activityMessage",function(req,res){	
	var address = req.params.locationName;
	var sensor = false;
	geo.geocoder = (geo.google,address,sensor,setToGoogleGeoedLocation);
	everyone.now.updateLocation(req.params.locationName,req.params.activityMessage);
	res.end();
});

httpServer.listen(1234);
console.log("listening at localhost:1234");




