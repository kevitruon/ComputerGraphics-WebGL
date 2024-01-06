// BlockyWorld.js
// Kevin Truong (ktruon13)
// Vertex shader program

var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    //gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;                   // use color

    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);          // use uv debug color

    } else if (u_whichTexture == 0) {     
      gl_FragColor = texture2D(u_Sampler0, v_UV);   // use texture0

    } else if (u_whichTexture == 1) {     
      gl_FragColor = texture2D(u_Sampler1, v_UV);   // use texture1

    } else if (u_whichTexture == 2) {     
      gl_FragColor = texture2D(u_Sampler2, v_UV);   // use texture2


    } else {
      gl_FragColor = vec4(1, 1, 1, 1);         
    }
  }`;
//Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ProjectionMatrix;
let u_viewMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;

//UI Globals
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_globalAnglex = 0;
let g_globalAngley = 0;
let g_animation = true;
let g_camera;

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
    console.log("Failed to intialize shaders.");
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  if (a_UV < 0) {
    console.log("Failed to get the storage location of a_UV");
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
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

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (!u_ViewMatrix) {
    console.log("Failed to get the storage location of u_ViewMatrix");
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  if (!u_ProjectionMatrix) {
    console.log("Failed to get the storage location of u_ProjectionMatrix");
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  if (!u_Sampler0) {
    console.log("Failed to get the storage location of u_Sampler0");
    return;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  if (!u_Sampler1) {
    console.log("Failed to get the storage location of u_Sampler1");
    return;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");
  if (!u_Sampler2) {
    console.log("Failed to get the storage location of u_Sampler2");
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
  if (!u_whichTexture) {
    console.log("Failed to get storage location of u_whichTexture");
    return;
  }

  var matrixM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrixM.elements);
}
function initTextures() {
  var image = new Image();
  if (!image) {
    console.log("Failed to create the image object");
    return false;
  }

  var image1 = new Image();
  if (!image1) {
    console.log("Failed to create the image1 object");
    return false;
  }

  var image2 = new Image();
  if (!image2) {
    console.log("Failed to create the image2 object");
    return false;
  }

  // Register the event handler to be called on loading an image

  image.onload = function () {
    sendImageToTEXTURE0(image);
  };
  image.src = "floor.jpg";
  // Add more texture loading

  image1.onload = function () {
    sendImageToTEXTURE1(image1);
  };
  image1.src = "wall.jpg";

  image2.onload = function () {
    sendImageToTEXTURE2(image2);
  };
  image2.src = "sky.jpg";

  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // flip the image's y axis
  // enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  console.log("finished loadTexture");
}

function sendImageToTEXTURE1(image) {
  var texture1 = gl.createTexture();
  if (!texture1) {
    console.log("Failed to create the texture1 object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // flip the image's y axis
  // enable texture unit 1
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture1);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);

  console.log("finished loadTexture1");
}

function sendImageToTEXTURE2(image) {
  var texture2 = gl.createTexture();
  if (!texture2) {
    console.log("Failed to create the texture2 object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // flip the image's y axis
  // enable texture unit 2
  gl.activeTexture(gl.TEXTURE2);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture2);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler2, 2);

  console.log("finished loadTexture2");
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
  document.getElementById("stand").addEventListener("mousemove", function () {
    g_stand = this.value;
    renderAllShapes();
  });
}

function click(ev) {
  let [x, y] = connectCoordinatesEventToGL(ev);

  g_globalAnglex -= x * 3;
  g_globalAngley += x * 3;

  renderAllShapes();
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
    g_body = 4 * Math.sin(2 * g_seconds);
    g_head = -4 * Math.sin(2 * g_seconds);
    g_leg1 = 5 * Math.sin(4 * g_seconds);
    g_leg2 = 5 * Math.cos(4 * g_seconds);
  }
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  updateAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  initTextures();
  document.onkeydown = keydown;
  g_camera = new Camera();

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clearColor(0.3, 0.3, 0.0, 1.0);

  // Register function (event handler) to be called on a mouse press
  canvas.onmousemove = function (ev) {
    if (ev.buttons == 1) {
      click(ev);
    }
  };
  requestAnimationFrame(tick);
}

function keydown(ev) {
  if (ev.keyCode == 65) {
    // a
    g_camera.eye.elements[0] -= 0.2;
    //g_camera.moveLeft();
  } else if (ev.keyCode == 68) {
    // d
    g_camera.eye.elements[0] += 0.2;
    //g_camera.moveRight();
  } else if (ev.keyCode == 87) {
    // w
    g_camera.moveForward();
  } else if (ev.keyCode == 83) {
    // s
    g_camera.moveBackward();
  } else if (ev.keyCode == 81) {
    // q
    g_camera.panLeft();
  } else if (ev.keyCode == 69) {
    // e
    g_camera.panRight();
  }
  renderAllShapes();
  console.log(ev.keyCode);
}

var g_eye = [0, 0, 3];
var g_at = [0, 0, -10];
var g_up = [0, 1, 0];

var g_map = [
  [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  [
    1, 0, 3, 0, 0, 0, 4, 0, 0, 0, 4, 0, 2, 0, 1, 3, 2, 0, 0, 0, 2, 0, 0, 0, 0,
    0, 2, 0, 4, 0, 5, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  [
    1, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 1,
    0, 0, 3, 0, 4, 0, 1,
  ],
  [
    1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 1, 0, 0, 1, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 2, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  [
    1, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 3, 0, 2, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 4, 0, 0, 1,
  ],
  [
    1, 0, 0, 3, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 3, 0, 0, 0, 0, 0,
    0, 0, 0, 3, 2, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 2, 0, 0, 0, 1,
  ],
  [
    1, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 3, 0, 0, 2, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 3, 0, 1,
  ],
  [
    1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 2, 0, 0, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 4, 0, 0, 1,
  ],
  [
    1, 0, 3, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 2, 0, 1, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  [
    1, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 3, 0, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  [
    1, 3, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 4, 0, 0, 0, 1,
  ],
  [
    1, 0, 0, 0, 0, 3, 0, 2, 0, 4, 5, 0, 2, 0, 3, 0, 6, 0, 6, 0, 2, 0, 0, 0, 0,
    0, 0, 0, 0, 4, 0, 1,
  ],
  [
    1, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 0, 0, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
  ],
];

function drawMap() {
  for (x = 0; x < 32; x++) {
    for (y = 0; y < 32; y++) {
      if (g_map[x][y] > 0) {
        var block = new Cube();
        block.textureNum = 1;
        block.color = [1.0, 1.0, 1.0, 1.0];
        block.matrix.translate(x - 16, -0.75, y - 16);
        block.render();
        for (z = 0; z < g_map[x][y]; z++) {
          block.textureNum = 1;
          block.color = [1.0, 1.0, 1.0, 1.0];
          block.matrix.translate(0, 1, 0);
          block.render();
        }
      }
    }
  }
}
function renderAllShapes() {
  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width / canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0],
    g_camera.eye.elements[1],
    g_camera.eye.elements[2],
    g_camera.at.elements[0],
    g_camera.at.elements[1],
    g_camera.at.elements[2],
    g_camera.up.elements[0],
    g_camera.up.elements[1],
    g_camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngley, 1, 0, 0);
  globalRotMat.rotate(g_globalAnglex, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //floor
  var floor = new Cube();
  floor.textureNum = 0;
  floor.matrix.translate(0, -0.75, 0.0);
  floor.matrix.scale(33, 0, 33);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.render();

  //sky
  var sky = new Cube();
  sky.textureNum = 2;
  sky.matrix.scale(33, 50, 33);
  sky.matrix.translate(-0.5, 0, -0.5);
  sky.render();

  //Wood
  var wall = new Cube();
  wall.textureNum = 1;
  wall.matrix.scale(1, 1, 1);
  wall.matrix.translate(-6, -0.2, -0.5);
  wall.render();

  drawMap();

  //Body
  var body = new Cube();
  body.color = [0.73, 0.35, 0.09, 1.0];
  body.matrix.translate(-0.3, -0.2, -0.25);
  body.matrix.scale(0.8, 0.5, 0.5);
  body.matrix.rotate(g_body / 90, 1, 0, 0);
  body.matrix.rotate(-g_stand, 0, 0, 1);
  body.matrix.translate(-g_stand / 100, g_stand / 100, 0);

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
  leftArm.matrix.translate(g_stand / 22, g_stand / 450, 0);
  leftArm.render();
  //Right arm
  var rightArm = new Cube();
  rightArm.color = [0.76, 0.35, 0.09, 1.0];
  rightArm.matrix.translate(-0.28, -0.4, 0.1);
  rightArm.matrix.scale(0.1, 0.5, 0.1);
  rightArm.matrix.rotate(g_leg1, 0, 0, 1);
  rightArm.matrix.translate(g_leg1 / 20, 0, 0);
  rightArm.matrix.translate(g_stand / 22, g_stand / 450, 0);
  rightArm.render();

  //Head
  var head = new Cube();
  head.color = [0.78, 0.35, 0.09, 1.0];
  head.matrix.translate(-0.6, -0.125, -0.27);
  head.matrix.scale(0.52, 0.52, 0.52);

  //Chainsaw
  var saw = new Cube();
  saw.color = [0.3, 0.3, 0.3, 1.0];
  saw.matrix.translate(-0.9, 0.2, -0.04);
  saw.matrix.scale(0.7, 0.3, 0.1);

  var sawIn = new Cube();
  sawIn.color = [0.5, 0.5, 0.5, 1.0];
  sawIn.matrix.translate(-0.87, 0.23, -0.05);
  sawIn.matrix.scale(0.65, 0.25, 0.12);

  //Handguard
  var lHorn = new Cube();
  var rHorn = new Cube();
  var bar = new Cube();
  lHorn.color = [0, 0, 0, 1];
  rHorn.color = [0, 0, 0, 1];
  bar.color = [0, 0, 0, 1];
  lHorn.matrix.translate(-0.25, 0.2, -0.3);
  rHorn.matrix.translate(-0.25, 0.2, 0.2);
  bar.matrix.translate(-0.25, 0.5, -0.3);
  lHorn.matrix.scale(0.1, 0.4, 0.1);
  rHorn.matrix.scale(0.1, 0.4, 0.1);
  bar.matrix.scale(0.1, 0.1, 0.5);

  //Eyes
  var eye = new Cube();
  var pupil = new Cube();
  eye.color = [1, 1, 1, 1];
  pupil.color = [0, 0, 0, 1];
  eye.matrix.translate(-0.4, 0.2, -0.3);
  pupil.matrix.translate(-0.38, 0.25, -0.31);
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

  head.matrix.translate(g_stand / 50, g_stand / 80, 0);
  saw.matrix.translate(g_stand / 60, g_stand / 35, 0);
  sawIn.matrix.translate(g_stand / 55, g_stand / 30, 0);
  lHorn.matrix.translate(g_stand / 10, g_stand / 50, 0);
  rHorn.matrix.translate(g_stand / 10, g_stand / 50, 0);
  bar.matrix.translate(g_stand / 10, g_stand / 12.5, 0);
  eye.matrix.translate(g_stand / 10, g_stand / 14, 0);
  pupil.matrix.translate(g_stand / 3.5, g_stand / 5, 0);

  head.render();
  saw.render();
  sawIn.render();
  lHorn.render();
  rHorn.render();
  bar.render();
  eye.render();
  pupil.render();
}
