var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , arDrone = require('ar-drone');
var client = arDrone.createClient();

var port = 3000
app.listen(port);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

function stop() {
  setTimeout(function() { client.stop(); console.log("done"); }, 1000);
}

io.sockets.on('connection', function (socket) {
  socket.on('takeoff', function (data) {
    console.log('TAKEOFF!');
    client.takeoff();
  });

  socket.on('land', function (data) {
    console.log('LANDING!');
    client.land();
  });

  socket.on('right', function (data) {
    console.log('right');
    client.right(0.05);
    stop();
  });

  socket.on('left', function (data) {
    console.log('left');
    client.left(0.05);
    stop();
  });
});
