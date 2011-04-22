var express = require("express");
var httpServer = express.createServer();
var nowjs=require("now");
var everyone = nowjs.initialize(httpServer);

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
//	httpServer.set('views', __dirname + '/views');
//	httpServer.set('view engine','jade');
//	httpServer.set('view options', {
//	  layout: true
//	});
});
httpServer.configure("development",function(){
	httpServer.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	httpServer.use(express.static(__dirname + '/public'));
});
httpServer.configure("production",function(){
	httpServer.use(express.errorHandler());
	httpServer.use(express.static(__dirname + '/public', { maxAge: oneYear }));
});


httpServer.get("/update",function(req,res){
	position = {};
	everyone.now.updateLocation({lng:"0.1",lat:"0.1"});
	res.end();
});

httpServer.listen(1234);


console.log("listening at localhost:1234");




