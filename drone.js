var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , arDrone = require('ar-drone')
  , png = require('ar-drone-png-stream');

var directMode = true;
var configs = [
  {"name":"tumblrbot", "ip":"192.168.33.10"},
  {"ip":"192.168.33.20"},
  {"ip":"192.168.33.30"}
];

var clients = [];
if (directMode) {
  console.log("DIRECT MODE - skipping configs, only connecting to one drone");
  client = arDrone.createClient();
  client.name = "LOCAL DRONE";
  clients.push(client);
  png(client, {port: 8010});
} else {
  configs.forEach(function(config, i) {
    var newClient = arDrone.createClient(config);
    newClient.name = (config.name !== undefined) ? config.name : config.ip;
    clients.push(newClient);
    var pngPort = 80 + config.ip.substring(11, 13);
    png(newClient, {"port": pngPort});
    console.log("setting up " + newClient.name + " with png port " + pngPort);
  });
}

var port = 3000;
server.listen(port);

app.use('/js', express.static(__dirname + '/js'));
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});


function stopAfter(ms) {
  clients.forEach(function(client) {
    setTimeout(function() { client.stop(); console.log(client.name + " stop"); }, ms);
  });
}


io.sockets.on('connection', function (socket) {
  socket.on('left-right', function (data) {
    console.log('LEFT-RIGHT');
    console.log("1. left!");
    clients.forEach(function(client) {
      client.left(0.5);
    });
    stopAfter(1000);

    setTimeout(function() {
      console.log("2. right!");
      clients.forEach(function(client) {
        client.right(0.5);
        stopAfter(1000);
      });
    }, 1100);
  });

  socket.on('wave', function (data) {
    console.log('WAVE');
    clients.forEach(function(client) {
      client.animate('wave', 2);
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
      client.takeoff(function() {
        console.log("takeoff completed");
      });
    });
  });

  socket.on('fancytakeoff', function (data) {
    console.log('FANCY TAKEOFF!');
    clients.forEach(function(client) {
      client.takeoff();

      setTimeout(function() {
        console.log("1. up");
        clients.forEach(function(client) {
          client.up(0.6);
          stopAfter(1500);
        });
      }, 5000);
    });
  });

  socket.on('land', function (data) {
    console.log('LANDING!');
    clients.forEach(function(client, i) {
      if (i == 0) {
        console.log('squad leader up!');
        client.up(0.6);
        stopAfter(2000);
        setTimeout(function() {
          console.log('squad leader flip!');
          client.animate('flipLeft', 500);
          stopAfter(1500);
        }, 3000);

        setTimeout(function() {
          console.log('squad leader landing start!');
          client.land(function() {
            console.log('squad leader landing complete!');
          });
        }, 6000);

        setTimeout(function() {
          console.log('squad leader landing backup start!');
          client.land(function() {
            console.log('squad leader landing backup complete!');
          });
        }, 10000);

        setTimeout(function() {
          console.log('squad leader landing backup2 start!');
          client.land(function() {
            console.log('squad leader landing backup2 complete!');
          });
        }, 14000);

      } else {
        client.land(function() {
          console.log('landing complete!');
        });
      }
    });
  });

  socket.on('right', function (data) {
    console.log('RIGHT');
    clients.forEach(function(client) {
      client.right(0.2);
    });
    stopAfter(2000);
  });

  socket.on('front', function (data) {
    console.log('FRONT');
    clients.forEach(function(client) {
      client.front(0.2);
    });
    stopAfter(2000);
  });


  socket.on('back', function (data) {
    console.log('BACK');
    clients.forEach(function(client) {
      client.back(0.2);
    });
    stopAfter(2000);
  });

  socket.on('left', function (data) {
    console.log('LEFT');
    clients.forEach(function(client) {
      client.left(0.2);
    });
    stopAfter(2000);
  });

  socket.on('clockwise', function (data) {
    console.log('SPIN');
    clients.forEach(function(client) {
      client.clockwise(1);
    });
    stopAfter(4000);
  });

  socket.on('counterclockwise', function (data) {
    console.log('SPIN CCW');
    clients.forEach(function(client) {
      client.counterClockwise(1);
    });
    stopAfter(4000);
  });

  socket.on('spinblink', function (data) {
    console.log('SPIN BLINK');
    clients.forEach(function(client) {
      client.clockwise(1);
      client.animateLeds('redSnake', 5, 4);
      stopAfter(4000);
    });
  });

  socket.on('up', function (data) {
    console.log('UP');
    clients.forEach(function(client) {
      client.up(0.6);
    });
    stopAfter(2000);
  });

  socket.on('down', function (data) {
    console.log('DOWN');
    clients.forEach(function(client) {
      client.down(0.6);
    });
    stopAfter(2000);
  });

  socket.on('flip', function (data) {
    console.log('!!!! FLIP !!!!');
    console.log("1. going up!");
    clients.forEach(function(client) {
      client.up(0.5);
    });
    stopAfter(2000);

    setTimeout(function() {
      console.log("2. do a barrel roll!");
      clients.forEach(function(client) {
        client.animate('flipLeft', 500);
        stopAfter(1500);
      });
    }, 2100);

  });
});
