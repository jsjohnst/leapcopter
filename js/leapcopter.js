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

function sendCommandImmediate(cmd) {
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
        if(gesture == "swipe" && sub) {
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

Leap.loop(controllerOptions, function(event) {
   if (event.hands.length == 2) {
        if(event.gestures.length == 2) {
            var hand1 = detectMovement(event.gestures[0]);
            var hand2 = detectMovement(event.gestures[1]);

            if(hand1 == "up" && hand2 == "up") {
                return gestureRecognized("multi", "up");
            } 
        }

        if(event.pointables.length >= 6) {
            lotsoffingers = true;
            setTimeout(function() { lotsoffingers = false; }, 2000); 
        }
    
        if(lotsoffingers && event.pointables.length <= 2) {
            return gestureRecognized("multi", "down");
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
