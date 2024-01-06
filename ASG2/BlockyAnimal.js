// asg2.js
// Kevin Truong (ktruon13)
// Vertex shader program

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

//Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
//let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
//Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
//UI Globals
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_globalAnglex = 0;
let g_globalAngley = 0;
let g_animation = true;


function setupWebGL() {
  canvas = document.getElementById("webgl");
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders.");
    return;
  }
  // Get the storage location of a_Position variable
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }
  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(
    gl.program,
    "u_GlobalRotateMatrix"
  );
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHtmlUI() {
  //Button Events
  document.getElementById("on").onclick = function () {
    g_animation = true;
  };
  document.getElementById("off").onclick = function () {
    g_animation = false;
  };
  //Slider Events
  document.getElementById('stand').addEventListener('mousemove', function () { g_stand = this.value; renderAllShapes(); });
}

function click(ev) {
  let [x, y] = connectCoordinatesEventToGL(ev);
  // Store the coordinates to g_points array
  // let point;
  // if (g_selectedShape == POINT) {
  //   point = new Point();
  // } else if (g_selectedShape == TRIANGLE) {
  //   point = new Triangle();
  // } else {
  //   point = new Circle();
  //   point.segments = g_selectedSeg;
  // }
  // point.position = [x, y];
  // point.color = g_selectedColor.slice();
  // point.size = g_selectedSize;
  // g_shapesList.push(point);
  // renderAllShapes();
  g_globalAnglex -= x * 3;
  g_globalAngley += x * 3;
}

function connectCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

//Global Variable for Animation
var g_head = 0;
var g_leg1 = 0;
var g_leg2 = 0;
var g_body = 0;
var g_stand = 0;

function updateAngles() {
  if (g_animation) {
    g_body = (4 * Math.sin(2 * g_seconds));
    g_head = (-4 * Math.sin(2 * g_seconds));
    g_leg1 = (5 * Math.sin(4 * g_seconds));
    g_leg2 = (5 * Math.cos(4 * g_seconds));
  }
}

function renderAllShapes() {
  var globalRotMat = new Matrix4().rotate(g_globalAnglex, 0, 1, 0);
  globalRotMat.rotate(g_globalAngley, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //Body
  var body = new Cube();
  body.color = [0.73, 0.35, 0.09, 1.0];
  body.matrix.translate(-.3, -0.2, -0.25);
  body.matrix.scale(.8, .5, .5);
  body.matrix.rotate(g_body/90, 1, 0, 0);
  body.matrix.rotate(-g_stand,0,0,1);
  body.matrix.translate(-g_stand/100,g_stand/100,0);
 
  body.render();
  //Left leg
  var leftLeg = new Cube();
  leftLeg.color = [0.76, 0.35, 0.09, 1.0];
  leftLeg.matrix.translate(0.35, -0.4, -0.2);
  leftLeg.matrix.scale(0.1, 0.5, 0.1);
  leftLeg.matrix.rotate(g_leg1, 0, 0, 1);
  leftLeg.matrix.translate(g_leg1 / 20, 0, 0);
  leftLeg.render();
  //Right leg
  var rightLeg = new Cube();
  rightLeg.color = [0.76, 0.35, 0.09, 1.0];
  rightLeg.matrix.translate(0.35, -0.4, 0.1);
  rightLeg.matrix.scale(0.1, 0.5, 0.1);
  rightLeg.matrix.rotate(g_leg2, 0, 0, 1);
  rightLeg.matrix.translate(g_leg2 / 20, 0, 0);
  rightLeg.render();
  //Left arm
  var leftArm = new Cube();
  leftArm.color = [0.76, 0.35, 0.09, 1.0];
  leftArm.matrix.translate(-0.28, -0.4, -0.2);
  leftArm.matrix.scale(0.1, 0.5, 0.1);
  leftArm.matrix.rotate(g_leg2, 0, 0, 1);
  leftArm.matrix.translate(g_leg2 / 20, 0, 0);
  leftArm.matrix.translate(g_stand/22,g_stand/450,0);
  leftArm.render();
  //Right arm
  var rightArm = new Cube();
  rightArm.color = [0.76, 0.35, 0.09, 1.0];
  rightArm.matrix.translate(-0.28, -0.4, 0.1);
  rightArm.matrix.scale(0.1, 0.5, 0.1);
  rightArm.matrix.rotate(g_leg1, 0, 0, 1);
  rightArm.matrix.translate(g_leg1 / 20, 0, 0);
  rightArm.matrix.translate(g_stand/22,g_stand/450,0);
  rightArm.render();


  //Head
  var head = new Cube();
  head.color = [0.78, 0.35, 0.09, 1.0];
  head.matrix.translate(-.6, -0.125, -0.27);
  head.matrix.scale(.52, .52, .52);

  //Chainsaw
  var saw = new Cube();
  saw.color = [0.3, .3, 0.3, 1.0];
  saw.matrix.translate(-.9, 0.2, -0.04);
  saw.matrix.scale(0.7, 0.3, 0.1);

  var sawIn = new Cube();
  sawIn.color = [0.5, .5, 0.5, 1.0];
  sawIn.matrix.translate(-.87, 0.23, -0.05);
  sawIn.matrix.scale(0.65, 0.25, 0.12);

  //Handguard
  var lHorn = new Cube();
  var rHorn = new Cube();
  var bar = new Cube();
  lHorn.color = [0, 0, 0, 1];
  rHorn.color = [0, 0, 0, 1];
  bar.color = [0, 0, 0, 1];
  lHorn.matrix.translate(-.25, 0.2, -0.3);
  rHorn.matrix.translate(-.25, 0.2, 0.2);
  bar.matrix.translate(-.25, 0.5, -0.3);
  lHorn.matrix.scale(0.1, 0.4, 0.1);
  rHorn.matrix.scale(0.1, 0.4, 0.1);
  bar.matrix.scale(0.1, 0.1, 0.5);

  //Eyes
  var eye = new Cube();
  var pupil = new Cube
  eye.color = [1, 1, 1, 1];
  pupil.color = [0, 0, 0, 1];
  eye.matrix.translate(-.4, 0.2, -0.3);
  pupil.matrix.translate(-.38, 0.25, -0.31);
  eye.matrix.scale(0.1, 0.1, 0.58);
  pupil.matrix.scale(0.035, 0.035, 0.58);

  head.matrix.rotate(g_head / 10, 1, 0, 0);
  saw.matrix.rotate(g_head / 10, 1, 0, 0);
  sawIn.matrix.rotate(g_head / 10, 1, 0, 0);
  lHorn.matrix.rotate(g_head / 10, 1, 0, 0);
  rHorn.matrix.rotate(g_head / 10, 1, 0, 0);
  bar.matrix.rotate(g_head / 10, 1, 0, 0);
  eye.matrix.rotate(g_head / 10, 1, 0, 0);
  pupil.matrix.rotate(g_head / 10, 1, 0, 0);

  saw.matrix.translate(0, 0, g_head / 500);
  sawIn.matrix.translate(0, 0, g_head / 500);
  lHorn.matrix.translate(0, 0, g_head / 500);
  rHorn.matrix.translate(0, 0, g_head / 500);
  bar.matrix.translate(0, 0, -g_head / 500);
  eye.matrix.translate(0, 0, g_head / 500);
  pupil.matrix.translate(0, 0, g_head / 500);

  head.matrix.translate(g_stand/50,g_stand/80,0);
  saw.matrix.translate(g_stand/60,g_stand/35,0);
  sawIn.matrix.translate(g_stand/55,g_stand/30,0);
  lHorn.matrix.translate(g_stand/10,g_stand/50,0);
  rHorn.matrix.translate(g_stand/10,g_stand/50,0);
  bar.matrix.translate(g_stand/10,g_stand/12.5,0);
  eye.matrix.translate(g_stand/10,g_stand/14,0);
  pupil.matrix.translate(g_stand/3.5,g_stand/5,0);

  head.render();
  saw.render();
  sawIn.render();
  lHorn.render();
  rHorn.render();
  bar.render();
  eye.render();
  pupil.render();
}


var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  console.log(g_seconds);
  updateAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousemove = function (ev) {
    if (ev.buttons == 1) {
      click(ev);
    }
  };
  gl.clearColor(0.3, 0.3, 0.7, 1.0);
  requestAnimationFrame(tick);
}
