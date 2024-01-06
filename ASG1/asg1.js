// asg1.js
// Kevin Truong (ktruon13)
// Vertex shader program

var VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "void main() {\n" +
  " gl_Position = a_Position;\n" +
  " gl_PointSize = 10.0;\n" +
  "}\n";
// Fragment shader program
var FSHADER_SOURCE =
  "precision mediump float;\n" +
  "uniform vec4 u_FragColor;\n" + // uniform variable <- (1)
  "void main() {\n" +
  " gl_FragColor = u_FragColor;\n" +
  "}\n";

// Global Variables
var canvas;
var gl;
var a_Position;
var u_FragColor;
var u_Size;
//Constants related UI elements
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
//Globals related UI elements
var g_selectedShape = POINT;
var g_selectedSize = 5;
var g_selectedColor = [1.0, 1.0, 1.0, 1.0];
var g_selectedSeg = 10;
var g_points = []; // The array for a mouse press
var g_colors = []; // The array to store the color of a point
var g_shapesList = [];


function setupWebGL() {
  canvas = document.getElementById("webgl");
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
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

  // Get the storage location of u_FragColor variable
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (u_FragColor < 0) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}


function addActionsForHtmlUI() {
  //Button Events
  document.getElementById("clearButt").onclick = function () {
    g_shapesList = []; renderAllShapes();
  };
  document.getElementById("squareButt").onclick = function () {
    g_selectedShape = POINT;
  };
  document.getElementById("triangleButt").onclick = function () {
    g_selectedShape = TRIANGLE;
  };
  document.getElementById("circleButt").onclick = function () {
    g_selectedShape = CIRCLE;
  };

  //Slider Events
  document.getElementById("rSlide").addEventListener("mouseup", function () {
    g_selectedColor[0] = this.value/100;
  });
  document.getElementById("gSlide").addEventListener("mouseup", function () {
    g_selectedColor[1] = this.value/100;
  });
  document.getElementById("bSlide").addEventListener("mouseup", function () {
    g_selectedColor[2] = this.value/100;
  });
  document.getElementById("sizeSlide").addEventListener("mouseup", function () {
    g_selectedSize = this.value;
  });
  document.getElementById("segSlide").addEventListener("mouseup", function () {
    g_selectedSeg = this.value;
  });
}

function click(ev) {
  let [x, y] = connectCoordinatesEventToGL(ev);
  // Store the coordinates to g_points array
  let point;
  if (g_selectedShape == POINT) {
    point = new Point();
  } else if (g_selectedShape == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSeg;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);
  renderAllShapes();
}

function connectCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return ([x, y]);
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for (var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function (ev) { if (ev.buttons == 1) { (click(ev)) } };

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}