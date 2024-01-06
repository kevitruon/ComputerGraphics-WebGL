// BlockyWorld.js
// Kevin Truong (ktruon13)
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    //gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    //v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`;

var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  uniform vec3 u_rgb;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;

  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0); // use normal
    } else if (u_whichTexture == -2) {
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
      gl_FragColor = vec4(1, .2, .2, 1);            // error, put reddish
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    // if (r < 1.0) {
    //   gl_FragColor = vec4(1, 0, 0, 1);
    // } else if (r < 2.0) {
    //   gl_FragColor = vec4(0, 1, 0, 1);
    // }

    // gl_FragColor = vec4(vec3(gl_FragColor) / (r * r), 1);

    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);
    // gl_FragColor = gl_FragColor * nDotL;
    // gl_FragColor.a = 1.0;

    // reflection
    vec3 R = reflect(-L, N);

    // eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    // specular
    float specular = pow(max(dot(E, R), 0.0), 10.0);

    vec3 rgb = u_rgb;
    vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.2;

    if (u_lightOn){
      if (u_whichTexture == 0){
        gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
      } else {
        gl_FragColor = vec4(diffuse+ambient, 1.0);
      }
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
let u_lightPos;
let u_lightOn;
let u_rgb;
let u_NormalMatrix;

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
  a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
  if (a_Normal < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return;
  }
  u_lightPos = gl.getUniformLocation(gl.program, "u_lightPos");
  if (!u_lightPos) {
    console.log("Failed to get the storage location of u_lightPos");
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, "u_cameraPos");
  if (!u_cameraPos) {
    console.log("Failed to get the storage location of u_cameraPos");
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, "u_lightOn");
  if (!u_lightOn) {
    console.log("Failed to get the storage location of u_lightOn");
    return;
  }

  u_rgb = gl.getUniformLocation(gl.program, "u_rgb");
  if (!u_rgb) {
    console.log("Failed to get the storage location of u_rgb");
    return;
  }

  u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
  if (!u_NormalMatrix) {
    console.log("Failed to get the storage location of u_NormalMatrix");
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
  document.getElementById("normalOn").onclick = function () {
    g_normalOn = true;
  };
  document.getElementById("normalOff").onclick = function () {
    g_normalOn = false;
  };
  document.getElementById("lightOff").onclick = function () {
    g_lightOn = false;
  };
  document.getElementById("lightOn").onclick = function () {
    g_lightOn = true;
  };
  //Slider Events
  document.getElementById("stand").addEventListener("mousemove", function () {
    g_stand = this.value;
    renderAllShapes();
  });
  document
    .getElementById("lightSlideX")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_lightPos[2] = this.value / 100;
        renderAllShapes();
      }
    });
  document
    .getElementById("lightSlideY")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_lightPos[2] = this.value / 100;
        renderAllShapes();
      }
    });
  document
    .getElementById("lightSlideZ")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_lightPos[2] = this.value / 100;
        renderAllShapes();
      }
    });

  document
    .getElementById("lightColorR")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_lightPos[2] = this.value / 100;
        renderAllShapes();
      }
    });
  document
    .getElementById("lightColorG")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_lightPos[2] = this.value / 100;
        renderAllShapes();
      }
    });
  document
    .getElementById("lightColorB")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_lightPos[2] = this.value / 100;
        renderAllShapes();
      }
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
let g_normalOn = false;
let g_lightOn = true;
let g_lightPos = [0, 1, -2];

function updateAngles() {
  if (g_animation) {
    g_body = 4 * Math.sin(2 * g_seconds);
    g_head = -4 * Math.sin(2 * g_seconds);
    g_leg1 = 5 * Math.sin(4 * g_seconds);
    g_leg2 = 5 * Math.cos(4 * g_seconds);
  }
  g_lightPos[0] = 2.3 * Math.cos(g_seconds);
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
  if (ev.keyCode == 87) {         // w
    // camera.moveForward();

    var d = new Vector3([0, 0, 0]);

    d.set(g_at);
    d.sub(g_eye);
    d.normalize();

    d.mul(0.1);
    g_at.add(d);
    g_eye.add(d);

  } else if (ev.keyCode == 83) {  // s
    // camera.moveBackward();

    var d = new Vector3([0, 0, 0]);

    d.set(g_at);
    d.sub(g_eye);
    d.normalize();

    d.mul(0.1);
    g_at.sub(d);
    g_eye.sub(d);

  } else if (ev.keyCode == 65) {  // a
    // camera.moveLeft();
    
    let d = new Vector3([0, 0, 0]);

    d.set(g_at);
    d.sub(g_eye);
    d.normalize();

    let left = Vector3.cross(d, g_up);
    left.mul(0.1);
    g_at.sub(left);
    g_eye.sub(left);

  } else if (ev.keyCode == 68) {  // d
    // camera.moveRight();

    let d = new Vector3([0, 0, 0]);

    d.set(g_at);
    d.sub(g_eye);
    d.normalize();

    let right = Vector3.cross(d, g_up);
    right.mul(0.1);
    g_eye.add(right);
    g_at.add(right);

  } else if (ev.keyCode == 81) {  // q
    let l = new Vector3([0, 0, 0]);
    l.set(g_at);
    l.sub(g_eye);

    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(5,  g_up.elements[0], g_up.elements[1], g_up.elements[2]);
    
    let rotate = rotationMatrix.multiplyVector3(l);
    let temp = new Vector3([0, 0, 0]);
    temp.set(g_eye);
    g_at = temp.add(rotate);

  } else if (ev.keyCode == 69) {  // e
    let l = new Vector3([0, 0, 0]);
    l.set(g_at);
    l.sub(g_eye);

    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(-5,  g_up.elements[0], g_up.elements[1], g_up.elements[2]);
    
    let rotate = rotationMatrix.multiplyVector3(l);
    let temp = new Vector3([0, 0, 0]);
    temp.set(g_eye);
    g_at = temp.add(rotate);
  }
  renderAllShapes();
  console.log(ev.keyCode);
}
let g_eye = new Vector3([0, 0, 3]);
let g_at = new Vector3([0, 0, -100]);
let g_up = new Vector3([0, 1, 0]);
let g_rgb = new Vector3([1, 1, 1]);



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

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(
    u_cameraPos,
    g_eye.elements[0],
    g_eye.elements[1],
    g_eye.elements[2]
  );
  gl.uniform1i(u_lightOn, g_lightOn);
  gl.uniform1i(u_rgb, g_rgb.elements[0], g_rgb.elements[1], g_rgb.elements[2]);

  var light = new Cube();
  light.color = [g_rgb.elements[0], g_rgb.elements[1], g_rgb.elements[2], 1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1, -0.1, -0.1);
  light.matrix.translate(-0.5, -0.5, -0.5);
  light.render();

  var sphere = new Sphere();
  sphere.textureNum = 0;
  if (g_normalOn) sphere.textureNum = -3;
  sphere.matrix.scale(0.4, 0.4, 0.4);
  sphere.matrix.translate(-3, -1, 0);
  sphere.render();

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

  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
