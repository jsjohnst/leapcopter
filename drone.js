var express = require('express');
var arDrone = require('ar-drone');
var client = arDrone.createClient();

var port = 3000;
var app = express();

/*
client.takeoff();

client
  .after(500, function() {
    this.clockwise(0.5);
  })
  .after(300, function() {
    this.animate('flipLeft', 15);
  })
  .after(100, function() {
    this.stop();
    this.land();
  });
console.log("hi");
*/

app.get('/takeoff', function(req, res){
  console.log("TAKEOFF!");
  client.takeoff();
});

app.get('/land', function(req, res){
  console.log("LAND!");
  client.land();
});

app.listen(port);
console.log("Listening on port " + port);
