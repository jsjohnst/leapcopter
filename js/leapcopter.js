var output = document.getElementById("output");

var inflight = false;
var last_sub = null;

function debounce(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
};

function audioPlay() {
    document.getElementById("music").play();
}

function audioStop() {
    setTimeout(function() { document.getElementById("music").pause(); hideCameras(); }, 1000);
}

var entered_grid = false;
var cameras_visible = 0;
var camera_last_change = null;

function showCamera(which) {
    if(which != (cameras_visible+1)) return;
    if(camera_last_change) {
        if(Date.now() - camera_last_change < 2500) return;
    }

    camera_last_change = Date.now();

    if(which == 1) {
        if(!entered_grid) {
            document.getElementById("cameras").className = "";
        }
    } else {
        entered_grid = true;
        document.getElementById("cameras").className = "grid";
    }

    document.getElementById("camera" + which).className += " show";

    if(which == 3) {
        gestureRecognized("multi", "up");
        document.getElementById("camera4").className += " show";
        which = 4;
    }

    cameras_visible = which;
}

function hideCameras() {
    for(var i = 1; i <= 4; i++) {
        document.getElementById("camera" + i).className = "camera";
    }
}

function updateText(cmd) {
    document.getElementById("text").innerHTML = cmd;
}

function sendCommandImmediate(cmd) {
    console.log(cmd);
    updateText(cmd); 
    socket.emit(cmd);
}

var sendCommand = debounce(function(cmd) {
    sendCommandImmediate(cmd);
    return true;
}, 250, true);

function gestureRecognized(gesture, sub) {
    if(!inflight) {
        if(gesture == "multi" && sub == "up") {
            sendCommandImmediate("takeoff");
            inflight = true;
        }
        return;
    } else {
        if(gesture == "swipe" && sub && sub != "up" && sub != "down") {
            sendCommand(sub);
        } else if(gesture == "spin" && sub) {
            sendCommandImmediate(sub);
        } else if(gesture == "multi" && sub == "down") {
            sendCommandImmediate("land");
            inflight = false;
        }
    }
}

function handleMovement(gesture) {
    gestureRecognized("swipe", detectMovement(gesture));
}

function detectMovement(gesture) {
    var d = gesture.direction;
    var velocity = 0;
    var plane = null;
    for(var index in d) {
        if(Math.abs(d[index]) > Math.abs(velocity)) {
            velocity = d[index];
            plane = index;
        }
    }
    switch(plane) {
        case "0":
            if(velocity < 0) {
                return "left";
            } else {
                return "right";
            }
            break;

        case "1":
            if(velocity < 0) {
                return "down";
            } else {
                return "up";
            }
            break;

        case "2":
            if(velocity < 0) {
                return "forward";
            } else {
                return "back";
            }
            break;

    }
}

function handleCircle(event, gesture) {
    var pointable = event.pointables[0];
    if(!pointable) {
        console.log("No pointable");
        return;
    }
    if(Leap.vec3.dot(pointable.direction, gesture.normal) > 0) {
        gestureRecognized("spin", "clockwise");
    } else {
        gestureRecognized("spin", "counterclockwise");
    }
}

var controllerOptions = {enableGestures: true};

var lotsoffingers = false;
var pointables_duration = 0;
var started = false;

Leap.loop(controllerOptions, function(event) {
   if (event.hands.length == 2) {
        if(event.gestures.length == 2) {
            var hand1 = detectMovement(event.gestures[0]);
            var hand2 = detectMovement(event.gestures[1]);

            if(hand1 == "up" && hand2 == "up") {
                return gestureRecognized("multi", "up");
            } 
        }

        if(event.pointables.length >= 8) {
            lotsoffingers = true;
            setTimeout(function() { lotsoffingers = false; }, 1000); 
        }
    
        if(inflight && lotsoffingers && event.pointables.length <= 2) {
            audioStop();
            pointables_duration = 0;
            lotsoffingers = false;
            return gestureRecognized("multi", "down");
        }
   }

   if (event.hands.length == 1) {
        if (event.pointables.length == 5) {
            pointables_duration++;
        }

        if(pointables_duration > 100) {
            started = true; 
            showCamera(1);
            audioPlay();
        }

        if (event.pointables.length > 1 && event.pointables.length < 5) {
            showCamera(event.pointables.length);
        }
   }

   if(event.gestures.length > 0) {
        var g = event.gestures[0];
        if(g.type == "circle" && g.state == "stop") {
            handleCircle(event, g);
        } else {
            handleMovement(g);
        }
   }
});
