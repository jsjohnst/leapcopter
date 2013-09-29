var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , arDrone = require('ar-drone');

var configs = [
  {"ip":"192.168.33.10"},
  {"ip":"192.168.33.20"},
  {"ip":"192.168.33.30"}
];

var clients = [];
configs.forEach(function(config, i) {
  clients.push(arDrone.createClient(config));
});

console.log(clients.length);

var port = 3000;
app.listen(port);

app.use('/js', express.static(__dirname + '/js'));
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

function stopAfter(ms) {
  clients.forEach(function(client) {
    setTimeout(function() { client.stop(); console.log("done"); }, 2000);
  });
}

io.sockets.on('connection', function (socket) {
  socket.on('dance', function (data) {
    console.log('dance');
    clients.forEach(function(client) {
      client.animate('yawShake', 2);
    });
  });

  socket.on('de', function (data) {
    console.log('disable emergency');
    clients.forEach(function(client) {
      client.disableEmergency();
    });
  });

  socket.on('blink', function (data) {
    console.log('blink');
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
    console.log('right');
    clients.forEach(function(client) {
      client.right(0.05);
    }
    stop();
  });

  socket.on('left', function (data) {
    console.log('left');
    clients.forEach(function(client) {
      client.left(0.05);
    }
    stop();
  });

  socket.on('clockwise', function (data) {
    console.log('spin');
    clients.forEach(function(client) {
      client.clockwise(1);
    }
    stop();
  });
});
/*
clients.forEach(function(client) {
  setTimeout(function() { client.stop(); console.log("done"); }, 2000);
});
*/
