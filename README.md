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
## usage
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



## License

This project retains the original MIT License from p5.joystick. You can find the full license text in the `LICENSE` file within this repository. 
