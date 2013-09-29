var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , arDrone = require('ar-drone')
  , png = require('ar-drone-png-stream');
var util = require('util');

var configs = [
  {"name":"tumblrbot", "ip":"192.168.33.10"},
  {"ip":"192.168.33.20"},
  {"ip":"192.168.33.30"}
];

var clients = [];
var streams = [];
configs.forEach(function(config, i) {
  var newClient = arDrone.createClient(config);
  newClient.name = (config.name !== undefined) ? config.name : config.ip;
  clients.push(newClient);
  var pngPort = 80 + config.ip.substring(11, 13);
  png(newClient, {"port": pngPort});
  console.log("setting up " + newClient.name + " with png port " + pngPort);
});

var port = 3000;
server.listen(port);

app.use('/js', express.static(__dirname + '/js'));
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});


function stopAfter(ms) {
  clients.forEach(function(client) {
    setTimeout(function() { client.stop(); console.log(client.name + " done"); }, ms);
  });
}


io.sockets.on('connection', function (socket) {
  socket.on('dance', function (data) {
    console.log('DANCE');
    clients.forEach(function(client) {
      client.animate('yawShake', 2);
    });
  });

  socket.on('de', function (data) {
    console.log('DISABLE EMERGENCY');
    clients.forEach(function(client) {
      client.disableEmergency();
    });
  });

  socket.on('stop', function (data) {
    console.log('STOP');
    clients.forEach(function(client) {
      client.stop();
    });
  });

  socket.on('blink', function (data) {
    console.log('BLINK');
    clients.forEach(function(client) {
      client.animateLeds('redSnake', 5, 2);
    });
  });

  socket.on('takeoff', function (data) {
    console.log('TAKEOFF!');
    clients.forEach(function(client) {
      client.takeoff();
    });
  });

  socket.on('land', function (data) {
    console.log('LANDING!');
    clients.forEach(function(client) {
      client.land();
    });
  });

  socket.on('right', function (data) {
    console.log('RIGHT');
    clients.forEach(function(client) {
      client.right(0.05);
    });
    stopAfter(2000);
  });

  socket.on('left', function (data) {
    console.log('LEFT');
    clients.forEach(function(client) {
      client.left(0.05);
    });
    stopAfter(2000);
  });

  socket.on('clockwise', function (data) {
    console.log('SPIN');
    clients.forEach(function(client) {
      client.clockwise(1);
    });
    stopAfter(2000);
  });
});
