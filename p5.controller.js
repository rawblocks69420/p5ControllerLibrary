//Code originally by vamos
//edited my rawblock69420

p5.prototype.createController = function(debug) {
	var _this = {
		name: "p5Joystick"
	};
	const DEBUG_CONTROL = debug;
	const DEFAULT_WIDTH = 440;
	const DEFAULT_HEIGHT = 200;
	var calibrating = false;

	var haveEvents = 'ongamepadconnected' in window;
	var controllers = {};

    var currentSelectedController;

	/*
	Event listeners
	*/
	var buttonPressedHandlers = [];
	var buttonReleasedHandlers = [];
	var axesPressedHandlers = [];
	var axesReleasedHandlers = [];
	_this.onButtonPressed = function(func) {
		buttonPressedHandlers.push(func);
	}
	_this.onButtonReleased = function(func) {
		buttonReleasedHandlers.push(func);
	}
	_this.onAxesPressed = function(func) {
		axesPressedHandlers.push(func);
	}
	_this.onAxesReleased = function(func) {
		axesReleasedHandlers.push(func);
	}

	/*
	Coordinates
	*/
	var coordinates = {};
	var prevX, prevY, prevW, prevH;
	function calculateCoordinates(x, y, w, h) {
        if (x == prevX && y == prevY && w == prevW && h == prevH)
			return;

		prevX = x;
		prevY = y;
		prevW = w;
		prevH = h;

		//sholder;
		const sW = 60 * h / DEFAULT_HEIGHT; //sholder width

		//axes
		const aW = 40 * h / DEFAULT_HEIGHT; //axes/button width
		const aS = 0.6; //space
		coordinates = {
			bumperLeft: {x: x - w - sW / 2, y: y - h / 2 - sW / 4, w: sW, h: sW / 3},
			bumperRight: {x: x + w - sW / 2, y: y - h / 2 - sW / 4, w: sW, h: sW / 3},

            //added
            triggerLeft: {x: x - w - sW / 6, y: y - h / 2 - sW *1.5 , w: sW /3, h: sW },
			triggerRight: {x: x + w - sW / 6, y: y - h / 2 - sW *1.5 , w: sW /3, h: sW },
            
            //keypad
            keypadUp: {x: x - w - aW / 2, y: y - aW / 2 * aS - aW, w: aW, h: aW},
			keypadDown: {x: x - w - aW / 2, y: y + aW / 2 * aS, w: aW, h: aW},
			keypadLeft: {x: x - w - aW / 2 * aS - aW, y: y - aW / 2, w: aW, 	h: aW},
			keypadRight: {x: x - w + aW / 2 * aS, y: y - aW / 2, w: aW, h: aW},

            //draws both of the axeses
			axesUp: {x: x - w - aW / 2, y: (y - aW / 2 * aS - aW) + aW * 5, w: aW, h: aW},
			axesDown: {x: x - w - aW / 2, y: (y + aW / 2 * aS) + aW * 5, w: aW, h: aW},
			axesLeft: {x: x - w - aW / 2 * aS - aW, y: (y - aW / 2) + aW * 5, w: aW, 	h: aW},
			axesRight: {x: x - w + aW / 2 * aS, y: (y - aW / 2) + aW * 5, w: aW, h: aW},

            rightAxesLeft: {x: x + w - aW * 0.9 - aW / 2, y: (y - aW / 2) + aW * 5, w: aW, h: aW},
			rightAxesUp: {x: x + w - aW / 2, y: (y - aW * 0.9 - aW / 2) + aW * 5, w: aW, h: aW},
			rightAxesRight: {x: x + w + aW * 0.9 - aW / 2, y: (y - aW / 2) + aW * 5, w: aW, h: aW},
			rightAxesDown: {x: x + w - aW / 2, y: (y + aW * 0.9 - aW / 2) + aW * 5, w: aW, h: aW},

			buttonBlue: {x: x + w - aW * 0.9 - aW / 2, y: y - aW / 2, w: aW, h: aW},
			buttonYellow: {x: x + w - aW / 2, y: y - aW * 0.9 - aW / 2, w: aW, h: aW},
			buttonRed: {x: x + w + aW * 0.9 - aW / 2, y: y - aW / 2, w: aW, h: aW},
			buttonGreen: {x: x + w - aW / 2, y: y + aW * 0.9 - aW / 2, w: aW, h: aW},
			start: {x: x - aW * 1.1, y: y, w: aW, h: aW / 2},
			select: {x: x + aW * .1, y: y, w: aW, h: aW / 2},

            saveBtn:{x:x-(aW*3)/2,y:y*2.2-(aW*3)/2, h: aW, w:aW*3, h: aW*3}
		}
		loadCalibration();
	}
	
	/*
	Calibration
	*/
	var calibration = {};
	loadCalibration = function(){
		var savedCalibration = localStorage.getItem('p5Joystick');
		if(savedCalibration){
			calibration = JSON.parse(savedCalibration);
			for (const [gamepadId, joystick] of Object.entries(calibration)){
				for (const [name, inputButton] of Object.entries(joystick)){
					if(coordinates[inputButton])
						coordinates[inputButton].button = name;
				}
			}
		}
	}
	loadCalibration();
	
	saveCalibration = function(name, gamepadId, inputButton) {

		coordinates[name].button = inputButton;
		if (!(gamepadId in calibration))
			calibration[gamepadId] = {};
		calibration[gamepadId][inputButton] = name;
	}


	getCalibrationName = function(gamepadId, inputButton) {
		if (gamepadId in calibration)
			if(inputButton in calibration[gamepadId])
				return calibration[gamepadId][inputButton];
		return "";
	}

	/*
	Public Methods
	*/
    _this.getCalibratingState = function(){
        return calibrating
    }

    _this.controllersNotCalibrated = function(){
        var controllersToCalibrate = []
        for(const [id, items] of Object.entries(controllers)){
            if (items.fullyCalibrated == false){
                controllersToCalibrate.push(id)
            }
        }
        return controllersToCalibrate
    }
	
	_this.calibrate = function(enable){
		calibrating = enable;
	}

	_this.getButtonPressedByName = function(name){
		if(coordinates[name] && coordinates[name].pressed){
			return coordinates[name].pressed;
		}
		return false;
	}

	_this.getButtonPressedByIndex = function(gamepadIndex, buttonIndex){
		if(controllers[gamepadIndex] && controllers[gamepadIndex].gamepad.buttons[buttonIndex])
			return controllers[gamepadIndex].gamepad.buttons[buttonIndex].pressed;
		return false;
	}

	_this.getAxesValueByIndex = function(gamepadIndex, axesIndex){
		if(controllers[gamepadIndex] && controllers[gamepadIndex].gamepad.axes[axesIndex])
			return controllers[gamepadIndex].gamepad.axes[axesIndex];
		return 0;
	}

	_this.draw = function(x, y, w, h) {
        if (calibrating){

            if(!x || !y) console.error("p5joystick draw() function: parameters x and y are required")

            w = w || DEFAULT_WIDTH;
            h = h || DEFAULT_HEIGHT;

            w -= h;
            w /= 2;
            y /= 1.2

            calculateCoordinates(x, y, w, h);

            push()

            with(coordinates) {
                rectMode(CORNER)
                textSize(15)

                noStroke();
                //bumpers
                fill(bumperLeft.pressed ? 200 : 127);
                rect(bumperLeft.x, bumperLeft.y, bumperLeft.w, bumperLeft.h, bumperLeft.w / 4, bumperLeft.w / 4, 0, 0);
                fill(bumperRight.pressed ? 200 : 127);
                rect(bumperRight.x, bumperRight.y, bumperRight.w, bumperRight.h, bumperRight.w / 4, bumperRight.w / 4, 0, 0);

                //triggers
                fill(triggerLeft.pressed ? 200 : 127);
                rect(triggerLeft.x, triggerLeft.y, triggerLeft.w, triggerLeft.h, triggerLeft.w / 4, triggerLeft.w / 4, 0, 0);
                fill(triggerRight.pressed ? 200 : 127);
                rect(triggerRight.x, triggerRight.y, triggerRight.w, triggerRight.h, triggerRight.w / 4, triggerRight.w / 4, 0, 0);



                //structure
                fill(255);
                circle(x - w, y, h);
                circle(x + w, y, h);
                rect(x - w, y - h / 2, w * 2, h * 0.75);


                //axes left
                fill(axesUp.pressed ? 200 : 127);
                rect(axesUp.x, axesUp.y, axesUp.w, axesUp.h, axesUp.w / 4, axesUp.w / 4, axesUp.w / 2, axesUp.w / 2);
                fill(axesDown.pressed ? 200 : 127);
                rect(axesDown.x, axesDown.y, axesDown.w, axesDown.h, axesDown.w / 2, axesDown.w / 2, axesDown.w / 4, axesDown.w / 4);
                fill(axesLeft.pressed ? 200 : 127);
                rect(axesLeft.x, axesLeft.y, axesLeft.w, axesLeft.h, axesLeft.w / 4, axesLeft.w / 2, axesLeft.w / 2, axesLeft.w / 4);
                fill(axesRight.pressed ? 200 : 127);
                rect(axesRight.x, axesRight.y, axesRight.w, axesRight.h, axesRight.w / 2, axesRight.w / 4, axesRight.w / 4, axesRight.w / 2);



                //axes right
                fill(rightAxesUp.pressed ? 200 : 127);
                rect(rightAxesUp.x, rightAxesUp.y, rightAxesUp.w, rightAxesUp.h, rightAxesUp.w / 4, rightAxesUp.w / 4, rightAxesUp.w / 2, rightAxesUp.w / 2);
                fill(rightAxesDown.pressed ? 200 : 127);
                rect(rightAxesDown.x, rightAxesDown.y, rightAxesDown.w, rightAxesDown.h, rightAxesDown.w / 2, rightAxesDown.w / 2, rightAxesDown.w / 4, rightAxesDown.w / 4);
                fill(rightAxesLeft.pressed ? 200 : 127);
                rect(rightAxesLeft.x, rightAxesLeft.y, rightAxesLeft.w, rightAxesLeft.h, rightAxesLeft.w / 4, rightAxesLeft.w / 2, rightAxesLeft.w / 2, rightAxesLeft.w / 4);
                fill(rightAxesRight.pressed ? 200 : 127);
                rect(rightAxesRight.x, rightAxesRight.y, rightAxesRight.w, rightAxesRight.h, rightAxesRight.w / 2, rightAxesRight.w / 4, rightAxesRight.w / 4, rightAxesRight.w / 2);


                //axes text
                fill(127);
                text("axes below",x, y*(6/4))


                //keypad
                fill(keypadUp.pressed ? 200 : 127);
                rect(keypadUp.x, keypadUp.y, keypadUp.w, keypadUp.h, keypadUp.w / 4, keypadUp.w / 4, keypadUp.w / 2, keypadUp.w / 2);
                fill(keypadDown.pressed ? 200 : 127);
                rect(keypadDown.x, keypadDown.y, keypadDown.w, keypadDown.h, keypadDown.w / 2, keypadDown.w / 2, keypadDown.w / 4, keypadDown.w / 4);
                fill(keypadLeft.pressed ? 200 : 127);
                rect(keypadLeft.x, keypadLeft.y, keypadLeft.w, keypadLeft.h, keypadLeft.w / 4, keypadLeft.w / 2, keypadLeft.w / 2, keypadLeft.w / 4);
                fill(keypadRight.pressed ? 200 : 127);
                rect(keypadRight.x, keypadRight.y, keypadRight.w, keypadRight.h, keypadRight.w / 2, keypadRight.w / 4, keypadRight.w / 4, keypadRight.w / 2);

                //save btn
                fill(color(0,255,0))
                rect(saveBtn.x, saveBtn.y,saveBtn.w,saveBtn.h)
                //stroke(127);
                fill(100)
                text("Save",x,saveBtn.y + saveBtn.h/2)

                //buttons
                fill(buttonYellow.pressed ? color(255, 255, 127) : color(255, 255, 0));
                circle(buttonYellow.x + buttonYellow.w / 2, buttonYellow.y + buttonYellow.h / 2, buttonYellow.w);

                fill(buttonBlue.pressed ? color(127, 127, 255) : color(0, 0, 255));
                circle(buttonBlue.x + buttonBlue.w / 2, buttonBlue.y + buttonBlue.h / 2, buttonBlue.w);

                fill(buttonRed.pressed ? color(255, 127, 127) : color(255, 0, 0));
                circle(buttonRed.x + buttonRed.w / 2, buttonRed.y + buttonRed.h / 2, buttonRed.w);

                fill(buttonGreen.pressed ? color(127, 255, 127) : color(0, 255, 0));
                circle(buttonGreen.x + buttonGreen.w / 2, buttonGreen.y + buttonGreen.h / 2, buttonGreen.w);

                fill(start.pressed ? 200 : 127);
                rect(start.x, start.y, start.w, start.h, start.w / 4, start.w / 4, start.w / 4, start.w / 4);

                fill(select.pressed ? 200 : 127);
                rect(select.x, select.y, select.w, select.h, select.w / 4, select.w / 4, select.w / 4, select.w / 4);
            
            }

            
            if (controllers[currentSelectedController]){
                if(controllers[currentSelectedController].gamepad.id){
                    noStroke();
                    fill(200)
                    text(controllers[currentSelectedController].gamepad.id, x, y/3);
                }
            }
            for (const [name, button] of Object.entries(coordinates)) {
                if (mouseIsPressed)
                    coordinates[name].selected = (mouseX > button.x && mouseX < button.x + button.w && mouseY > button.y && mouseY < button.y + button.h);
                stroke(0);
                if (button.selected)
                    fill(0, 255, 255, 100);
                else
                    fill(0, 100);
                rect(button.x, button.y, button.w, button.h);
                
                if (button.button && name != "saveBtn") {
                    fill(0);
                    noStroke();
                    text(button.button, button.x + button.w / 2 - 10, button.y + button.h / 2 + 2);
                }
            }
			//reverts changes so it doesn't edit designs
            pop(); 
        }
	}

	/*
	Gamepad events
	*/
	function connecthandler(e) {
		addgamepad(e.gamepad);
	}

	function addgamepad(gamepad) {
		controllers[gamepad.index] = {
			gamepad: gamepad,
			buttonPrevState: [],
			axesPrevState: [],
            fullyCalibrated: (calibration[gamepad.id])? true : false,
		};

		for (var i = 0; i < gamepad.buttons.length; i++) {
			controllers[gamepad.index].buttonPrevState[i] = {
				value: gamepad.buttons[i].value,
				pressed: gamepad.buttons[i].pressed
			}
		}

		for (var i = 0; i < gamepad.axes.length; i++) {
			controllers[gamepad.index].axesPrevState[i] = round(gamepad.axes[i]);
		}

		if (DEBUG_CONTROL) {
			var d = document.createElement("div");
			d.setAttribute("id", "controller" + gamepad.index);
			d.style.position = "absolute";
			d.style.top = "0px";
			d.style.left = (gamepad.index * 190) + "px";
			d.style.width = 170 + "px";

			var t = document.createElement("h3");
			t.appendChild(document.createTextNode("gamepad: " + gamepad.id));
			d.appendChild(t);

			var b = document.createElement("div");
			b.className = "buttons";
			b.style.margin = "10px 0px";
			for (var i = 0; i < gamepad.buttons.length; i++) {
				var e = document.createElement("span");
				e.className = "button";
				e.style.float = "left";
				e.style.width = "20px";
				e.style.textAlign = "center";
				e.style.border = "1px solid blue";
				e.style.margin = "1px";
				e.innerHTML = i;
				b.appendChild(e);
			}

			d.appendChild(b);

			var a = document.createElement("div");
			a.className = "axes";

			for (var i = 0; i < gamepad.axes.length; i++) {
				var p = document.createElement("progress");
				p.className = "axis";
				p.setAttribute("max", "2");
				p.setAttribute("value", "1");
				p.innerHTML = i;
				a.appendChild(p);
			}

			d.appendChild(a);

			document.body.appendChild(d);
		}
		requestAnimationFrame(updateStatus);
	}

	function disconnecthandler(e) {
		removegamepad(e.gamepad);
	}

	function removegamepad(gamepad) {
		if (DEBUG_CONTROL) {
			var d = document.getElementById("controller" + gamepad.index);
			document.body.removeChild(d);
		}
		delete controllers[gamepad.index];
	}

	function updateStatus() {
		if (!haveEvents) {
			scangamepads();
		}

		var i = 0;
		var j;

		for (j in controllers) {
            currentSelectedController = _this.controllersNotCalibrated()[0]
			var controller = controllers[j];
			var gamepad = controller.gamepad;

			var buttonPrevState = controller.buttonPrevState;
			for (i = 0; i < gamepad.buttons.length; i++) {
				var button = gamepad.buttons[i];
				if (buttonPrevState[i].value != button.value) {
					buttonPrevState[i].value = button.value;

					var eventObj = {
						gamepadName: gamepad.id,
						gamepadIndex: gamepad.index,
						value: button.value,
						index: i,
						pressed: button.pressed,
						type: "button",
						name: getCalibrationName(gamepad.id, "b" + i)
					}
					
					if(eventObj.name != "" && coordinates[eventObj.name])
						coordinates[eventObj.name].pressed = eventObj.pressed;
					
					if (button.pressed) {
						if (calibrating)
                            //here it needs to check if selected controller is calibrating
							for (const [name, button] of Object.entries(coordinates))
								if (button.selected && eventObj.pressed && name != "saveBtn")
									saveCalibration(name, gamepad.id, "b" + i);
                                else if(button.selected && name == "saveBtn" && j == currentSelectedController){
                                    //saves data upon saveBtn click
                                    localStorage.setItem('p5Joystick', JSON.stringify(calibration));
                                    //changes fully calibrated
                                    controller.fullyCalibrated = true
                                    if (_this.controllersNotCalibrated().length == 0){
                                        calibrating = false
                                    }
                                }
						buttonPressedHandlers.forEach(func => func(eventObj));
					} else {
						buttonReleasedHandlers.forEach(func => func(eventObj));
					}
				}
			}

			var axesPrevState = controller.axesPrevState;
			for (i = 0; i < gamepad.axes.length; i++) {
				var axesValue = round(gamepad.axes[i]);
				if (axesPrevState[i] != axesValue) {
					var eventObj = {
						gamepadName: gamepad.id,
						gamepadIndex: gamepad.index,
						value: axesValue,
						index: i,
						pressed: abs(axesValue) > 0.1,
						type: "axes"
					}
					if (eventObj.pressed)
						eventObj.name = getCalibrationName(gamepad.id, "a" + i + ":" + axesValue);
					else
						eventObj.name = getCalibrationName(gamepad.id, "a" + i + ":" + axesPrevState[i]);
					
					if(eventObj.name != "" && coordinates[eventObj.name])
						coordinates[eventObj.name].pressed = eventObj.pressed;
					
					if (eventObj.pressed) {
						if (calibrating) {
							for (const [name, button] of Object.entries(coordinates)) {
								if (button.selected && eventObj.pressed && name != "saveBtn")
									saveCalibration(name, gamepad.id, "a" + i + ":" + axesValue);
                                else if(button.selected && name == "saveBtn" && j == currentSelectedController){
                                    //saves data upon saveBtn click
                                    localStorage.setItem('p5Joystick', JSON.stringify(calibration));
                                    //changes fully calibrated
                                    controller.fullyCalibrated = true
                                    if (_this.controllersNotCalibrated().length == 0){
                                        calibrating = false
                                    }
                                }
							}
						}
						axesPressedHandlers.forEach(func => func(eventObj));
					} else
						axesReleasedHandlers.forEach(func => func(eventObj));
					axesPrevState[i] = axesValue;
				}
			}

			if (DEBUG_CONTROL) {
				var d = document.getElementById("controller" + j);
				var buttonsEl = d.getElementsByClassName("button");
				for (i = 0; i < gamepad.buttons.length; i++) {
					var button = gamepad.buttons[i];
					var pct = Math.round(button.value * 100) + "%";
					buttonsEl[i].style.backgroundSize = pct + " " + pct;
					if (button.pressed) {
						buttonsEl[i].style.backgroundColor = "blue";
						buttonsEl[i].style.color = "white";
					} else {
						buttonsEl[i].style.backgroundColor = "";
						buttonsEl[i].style.color = "";
					}
				}

				var axes = d.getElementsByClassName("axis");
				for (i = 0; i < gamepad.axes.length; i++) {
					var a = axes[i];
					a.innerHTML = i + ": " + gamepad.axes[i].toFixed(4);
					a.setAttribute("value", gamepad.axes[i] + 1);
				}
			}
		}

		requestAnimationFrame(updateStatus);
	}

	function scangamepads() {
		var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
		for (var i = 0; i < gamepads.length; i++) {
			if (gamepads[i]) {
				if (gamepads[i].index in controllers) {
					controllers[gamepads[i].index].gamepad = gamepads[i];
				} else {
					addgamepad(gamepads[i]);
				}
			}
		}
	}

	window.addEventListener("gamepadconnected", connecthandler);
	window.addEventListener("gamepaddisconnected", disconnecthandler);

	if (!haveEvents) {
		setInterval(scangamepads, 500);
	}

	return _this;
}



