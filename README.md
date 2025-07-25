# p5ControllerLibrary
Calibrates multiple unique controllers connected to your computer using the p5 library. 
A modified and extended version of the excellent p5.joystick library, providing enhanced features and compatibility.

## Original Project

This project builds upon the  work of Vamoss and their p5.joystick library. The original project can be found at: Vamoss/p5.joystick.

## Installation
it is It is necessary to insert p5.controller.js in your html:

```html
  <script src="js/p5.js"></script>
  <script src="p5.controller.js"></script>
  <script src="sketch.js"></script>
```
## Usage
```javascript
var controller;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);

  controller = createController();

  controller.onButtonPressed(onController);
  controller.onButtonReleased(onController);
  controller.onAxesPressed(onController);
  controller.onAxesReleased(onController);
}

function draw(){
  background(100);
  controller.draw(width/2, height/2);

  //doesn't run game code if in calibration mode
  
  if(controller.controllersNotCalibrated().length > 0) {
    controller.calibrate(true);
    return
  }
  // gamecode below...
}

function onController(e) {
  console.log("onController", e);
}
```

## Calibration
![Alt text](image.png?raw=true "Title")

to calibrate make sure to click the button the screen, and then push the associate button on your controller. When you are finished calibrating click the save button and push any button on your controller to finalize.

If you want to undo your calibrations, open up dev tools and look at application in one of the tabs. There you can see a json file that has your controller data stored. Just delete that and you can recalibrate your controller.

## Methods
look at this readme to find the methods of the library 
https://github.com/Vamoss/p5.joystick/blob/main/README.md 

## License

This project retains the original MIT License from p5.joystick. You can find the full license text in the `LICENSE` file within this repository. 
