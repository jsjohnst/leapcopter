var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , arDrone = require('ar-drone');
var client = arDrone.createClient({"ip":"192.168.33.10"});
var client2 = arDrone.createClient({"ip":"192.168.33.20"});
var client3 = arDrone.createClient({"ip":"192.168.33.30"});

var port = 3000;
app.listen(port);

app.use('/js', express.static(__dirname + '/js'));
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

function stop() {
  setTimeout(function() { client.stop(); console.log("done"); }, 2000);
  setTimeout(function() { client2.stop(); console.log("done"); }, 2000);
  setTimeout(function() { client3.stop(); console.log("done"); }, 2000);
}

io.sockets.on('connection', function (socket) {
  socket.on('dance', function (data) {
    console.log('dance');
    client.animate('yawShake', 2);
    client2.animate('yawShake', 2);
    client3.animate('yawShake', 2);
  });

  socket.on('de', function (data) {
    console.log('disable emergency');
    client.disableEmergency();
    client2.disableEmergency();
    client3.disableEmergency();
  });

  socket.on('blink', function (data) {
    console.log('blink');
    client.animateLeds('redSnake', 5, 2);
    client2.animateLeds('redSnake', 5, 2);
    client3.animateLeds('redSnake', 5, 2);
  });

  socket.on('takeoff', function (data) {
    console.log('TAKEOFF!');
    client.takeoff();
    client2.takeoff();
    client3.takeoff();
  });

  socket.on('land', function (data) {
    console.log('LANDING!');
    client.land();
    client2.land();
    client3.land();
  });

  socket.on('right', function (data) {
    console.log('right');
    client.right(0.05);
    client2.right(0.05);
    client3.right(0.05);
    stop();
  });

  socket.on('left', function (data) {
    console.log('left');
    client.left(0.05);
    client2.left(0.05);
    client3.left(0.05);
    stop();
  });

  socket.on('clockwise', function (data) {
    console.log('spin');
    client.clockwise(1);
    client2.clockwise(1);
    client3.clockwise(1);
    stop();
  });
});


