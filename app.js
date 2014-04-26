/**
 * Module dependencies.
 */
var express = require('express');
var bodyParser = require('body-parser');



var app = express();

app.use(bodyParser());
app.set('title', 'APP');

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/scores';
var mongo = require('mongodb');
var db = mongo.Db.connect(mongoUri, function (error, databaseConnection) {
  db = databaseConnection;
});

app.get('/', function (request, response) {
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
	response.set('Content-Type','text/html');
	var str = "\n";
	var scored = 0;
	mongo.Db.connect(mongoUri, function (err, db){
		db.collection("scores", function(er, col){
			col.find({}).sort("score").toArray(function(e, x){
				var length = x.length;
				for(var i = length-1; i >= 0; i--){
					str = str + x[i].name;
					str = str + " --- ";
					str = str + x[i].score;
					str = str + " --- ";
					str = str + x[i].timestamp;
					str = str + "<br>"
				}
				response.send(str);
			});
		});
	});
	console.log(scored);
});

app.post('/submit.json', function(request, response) {
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
	mongo.Db.connect(mongoUri, function (err, db){
		db.collection("scores", function (er, collection){
		var score = request.body.score;
		var name = request.body.name;
		var timeStamp = request.body.timeStamp;
		var grid = request.body.grid;
		  collection.insert({"score": score, "name": name, "grid": grid, "timestamp": timeStamp}, function (err, r){});
		  response.send("SWEET.");
		});
	});
});

app.get('/scores.json', function(request, response){
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
	var username = request.query.username;
	if (username == ""){
		response.send([]);
	}
	else{
		mongo.Db.connect(mongoUri, function (err, db){
			db.collection("scores", function(er, col){
				col.find({name: username}).sort("score").toArray(function(e, x){
					response.send(x);
				});
			});
		});
	}
});

app.listen(process.env.PORT || 3000);