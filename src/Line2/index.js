import * as PIXI from "pixi.js";
// import { EventSystem } from '@pixi/events';

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x283230
});
document.body.appendChild(app.view);
// PIXI.extensions.remove(PIXI.InteractionManager);
// app.renderer.addSystem(EventSystem, 'events');


// 1. PRELIMINARY COMPUTATIONS
// Coordinates of the end points of a line
let x0 = 100;
let y0 = 100;
let x1 = 200;
let y1 = 200;
// Find midpoint for translation
let xmid = 0.5*(x0+x1) - 30;
let ymid = 0.5*(y0+y1);

// 2. LINE 
let line = new PIXI.Graphics();
// Arbitrary line style, say we have a non-white background
line.lineStyle(2, 0xFF00FF, 1);
line.moveTo(x0,y0);
line.quadraticCurveTo(xmid, ymid, x1, y1)


// 3. ACCOMPANYING RECTANGLE
line.rectangle = new PIXI.Graphics();
line.rectangle.beginFill(0xffffff);

line.rectangle.moveTo(x0 - 2, y0 + 2);
line.rectangle.quadraticCurveTo(xmid - 2, ymid + 2, x1 -2, y1 + 2)
line.rectangle.lineTo(x1, y1)
line.rectangle.lineTo(x1 + 2, y1 - 2)
line.rectangle.quadraticCurveTo(xmid + 2, ymid - 2, x0 + 2, y0 - 2)
line.rectangle.lineTo(x0,y0)
line.rectangle.endFill();
line.rectangle.alpha = 0;
line.rectangle.interactive = true;
line.rectangle.on("pointerover", reactOver);
line.rectangle.on("pointerout", reactOut);

app.stage.addChild(line);
app.stage.addChild(line.rectangle);

// Let's change alpha value of the line when user hovers.
function reactOver(){
  console.log('-------- in -------')
 line.alpha = 0.5;
}
function reactOut(){
  console.log('------- out --------')
 line.alpha = 1;
}
