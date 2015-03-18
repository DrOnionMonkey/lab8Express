var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var app = express();
var basicAuth = require('basic-auth-connect');
var auth = basicAuth(function(user, pass) {
	return((user ==='cs360')&&(pass === 'test'));
});
var options = {
    host: '127.0.0.1',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};
  http.createServer(app).listen(80);
  https.createServer(options, app).listen(443);
  
  app.use(bodyParser());
  app.use('/', express.static('./html', {maxAge: 60*60*1000}));
  app.get('/getcity', function (req, res) {
    console.log("In getcity route");
    
    var urlObj = url.parse(req.url, true, false);
    fs.readFile('cities.dat.txt', function(err, data){
			if (err) {
			  res.writeHead(404);
			  res.end(JSON.stringify(err));
			  return;
			}
			var cities = data.toString().split('\n');
			var myRe = new RegExp("^"+urlObj.query['q']);
			var returnCities = [];
			for(var i in cities){
				var result = cities[i].search(myRe);
				if (result != -1){
					returnCities.push({city: cities[i]});
				}
			}
			res.writeHead(200);
			res.end(JSON.stringify(returnCities));
		});
    
    
    //res.json([{city:"Price"},{city:"Provo"}]);
  });
  app.get('/comment', function (req, res) {
    console.log("In comment route");
	
	var MongoClient = require('mongodb').MongoClient;
			  MongoClient.connect("mongodb://localhost/weather", function(err, db) {
				if(err) throw err;
				db.collection("comments", function(err, comments){
				  if(err) throw err;
				  comments.find(function(err, items){
					items.toArray(function(err, itemArr){
					  res.writeHead(200);
					  res.end(JSON.stringify(itemArr));
					});
				  });
				});
			  });
//    res.json(resarray);
  });
  app.post('/comment', auth, function (req, res) {
    console.log("In POST comment route");
    console.log(req.body);
	console.log(req.body.Name);
    console.log(req.body.Comment);
    
    // First read the form data
//	var jsonData = "";
//	req.on('data', function (chunk) {
//	jsonData += chunk;
//	});
//	req.on('end', function () {
//		var reqObj = JSON.parse(jsonData);
		var reqObj = req.body;
		
		// Now put it into the database
		var MongoClient = require('mongodb').MongoClient;
		MongoClient.connect("mongodb://localhost/weather", function(err, db) {
		  if(err) throw err;
		  db.collection('comments').insert(reqObj,function(err, records) {
		  });
		});
//	});

	res.writeHead(200);
	res.end();
    
//    res.status(200);
//    res.end();
  });
  
  /*
	app.post('/comment', auth, function (req, res) {
    console.log("In POST comment route");
    console.log(req.user);
    console.log("Remote User");
    console.log(req.remoteUser);
    res.status(200);
    res.end();
  });
  */
  
//app.listen(80);
// app.get('/', function (req, res) {
//   res.send("Get Index");
//  });
