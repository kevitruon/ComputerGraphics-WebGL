// asg0.js
var ctx;
var canvas;

function main() {
  // Retrieve <canvas> element <- (1)
  canvas = document.getElementById("asg0");
  if (!canvas) {
    console.log("Failed to retrieve the <canvas> element");
    return;
  }

  // Get the rendering context for 2DCG <- (2)
  ctx = canvas.getContext("2d");

  // Draw a black rectangle <- (3)
  ctx.fillStyle = "rgba(0, 0, 0, 1.0)"; // Set a black color
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color
}

function drawVector(v, color) {
  ctx.strokeStyle = color; //Set Stroke Color

  let cx = canvas.width / 2; //Getting center coodinates of canvas
  let cy = canvas.height / 2;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(
    cx + v.elements[0] * 20,
    cy - v.elements[1] * 20,
    v.elements[2] * 20
  );
  ctx.stroke();
}

function handleDrawEvent() {
  var x1 = document.getElementById("v1x").value;
  var y1 = document.getElementById("v1y").value;
  var x2 = document.getElementById("v2x").value;
  var y2 = document.getElementById("v2y").value;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var v1 = new Vector3([x1, y1, 0.0]);
  var v2 = new Vector3([x2, y2, 0.0]);
  drawVector(v1, "red");
  drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
  var x1 = document.getElementById("v1x").value;
  var y1 = document.getElementById("v1y").value;
  var x2 = document.getElementById("v2x").value;
  var y2 = document.getElementById("v2y").value;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var v1 = new Vector3([x1, y1, 0.0]);
  var v2 = new Vector3([x2, y2, 0.0]);
  drawVector(v1, "red");
  drawVector(v2, "blue");

  var opt = document.getElementById("option").value;
  var scalar = document.getElementById("scalar").value;
  if (opt == "add") {
    v1.add(v2);
    drawVector(v1, "green");
  } else if (opt == "sub") {
    v1.sub(v2);
    drawVector(v1, "green");
  } else if (opt == "div") {
    v1.div(scalar);
    drawVector(v1, "green");
    v2.div(scalar);
    drawVector(v2, "green");
  } else if (opt == "mul") {
    v1.mul(scalar);
    drawVector(v1, "green");
    v2.mul(scalar);
    drawVector(v2, "green");
  } else if (opt == "ang") {
    var d = Vector3.dot(v1, v2);
    var alpha = Math.acos(d / (v1.magnitude() * v1.magnitude()));
    alpha *= 180 / Math.PI;
    console.log("Angle: " + alpha.toFixed(2));
  } else if (opt == "are") {
    var sides = Vector3.cross(v1, v2);
    var tri = new Vector3([sides[0], sides[1], sides[2]]);
    var area = tri.magnitude() / 2;
    console.log("Area if this triangle: " + area.toFixed(2));
  } else if (opt == "mag") {
    console.log("Magnitude v1: " + v1.magnitude());
    console.log("Magnitude v2: " + v2.magnitude());
  }
  else if (opt == "nor") {
    drawVector(v1.normalize(),"green");
    drawVector(v2.normalize(),"green");
  }
}
