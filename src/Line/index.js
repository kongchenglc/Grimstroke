import * as PIXI from "pixi.js";

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x283230
});
document.body.appendChild(app.view);

// 1. PRELIMINARY COMPUTATIONS
// Coordinates of the end points of a line
let x0 = 100;
let y0 = 100;
let x1 = 200;
let y1 = 200;
// Find midpoint for translation
let xmid = 0.5*(x0+x1);
let ymid = 0.5*(y0+y1);
// Length of the line
let length = Math.hypot(x0-x1, y0-y1);
// Alignment angle of the line, i.e. angle with the x axis
let angle = Math.atan((y1-y0)/(x1-x0));

// 2. LINE 
let line = new PIXI.Graphics();
// Arbitrary line style, say we have a non-white background
line.lineStyle(8,0xffffff,1);
line.moveTo(x0,y0);
line.lineTo(x1,y1);


// 3. ACCOMPANYING RECTANGLE
line.rectangle = new PIXI.Graphics();
line.rectangle.beginFill(0xffffff);
// Since we are going to translate, think of 0,0 is the center point on the rectangle
// Width of the rectangle is selected arbitrarily as 30
const width = 30;
line.rectangle.drawRect(-length/2,-width/2,length,width);
line.rectangle.endFill();
line.rectangle.alpha = 0;
line.rectangle.interactive = true;
line.rectangle.on("pointerover", reactOver);
line.rectangle.on("pointerout", reactOut);
// Apply transformation
line.rectangle.setTransform(xmid, ymid,1,1,angle);

app.stage.addChild(line);
// Add rectangle to the stage too.
app.stage.addChild(line.rectangle);

// Let's change alpha value of the line when user hovers.
function reactOver(){
 line.alpha = 0.5;
}
function reactOut(){
 line.alpha = 1;
}
