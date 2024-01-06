// // HelloTriangle.js (c) 2012 matsuda
// // Vertex shader program
// var VSHADER_SOURCE =
//   'attribute vec4 a_Position;\n' +
//   'void main() {\n' +
//   '  gl_Position = a_Position;\n' +
//   '}\n';

// // Fragment shader program
// var FSHADER_SOURCE =
//   'void main() {\n' +
//   '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
//   '}\n';

// function main() {
//   // Retrieve <canvas> element
//   var canvas = document.getElementById('webgl');

//   // Get the rendering context for WebGL
//   var gl = getWebGLContext(canvas);
//   if (!gl) {
//     console.log('Failed to get the rendering context for WebGL');
//     return;
//   }

//   // Initialize shaders
//   if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
//     console.log('Failed to intialize shaders.');
//     return;
//   }

//   // Write the positions of vertices to a vertex shader
//   var n = initVertexBuffers(gl);
//   if (n < 0) {
//     console.log('Failed to set the positions of the vertices');
//     return;
//   }

//   // Specify the color for clearing <canvas>
//   gl.clearColor(0, 0, 0, 1);

//   // Clear <canvas>
//   gl.clear(gl.COLOR_BUFFER_BIT);

//   // Draw the rectangle
//   gl.drawArrays(gl.TRIANGLES, 0, n);
// }

// function initVertexBuffers(gl) {
//   var vertices = new Float32Array([
//     0, 0.5,   -0.5, -0.5,   0.5, -0.5
//   ]);
//   var n = 3; // The number of vertices

//   // Create a buffer object
//   var vertexBuffer = gl.createBuffer();
//   if (!vertexBuffer) {
//     console.log('Failed to create the buffer object');
//     return -1;
//   }

//   // Bind the buffer object to target
//   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//   // Write date into the buffer object
//   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

//   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
//   if (a_Position < 0) {
//     console.log('Failed to get the storage location of a_Position');
//     return -1;
//   }
//   // Assign the buffer object to a_Position variable
//   gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

//   // Enable the assignment to a_Position variable
//   gl.enableVertexAttribArray(a_Position);

//   return n;
// }

// 3D triangle
function drawTriangle(vertices) {
  //var vertices = new Float32Array([
  //  0, 0.5,   -0.5, -0.5,   0.5, -0.5
  //]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  //var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  //if (a_Position < 0) {
  //  console.log('Failed to get the storage location of a_Position');
  //  return -1;
  //}
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
  //return n;
}

function drawTriangleUV2(vertices, uv) {
  //var vertices = new Float32Array([
  //  0, 0.5,   -0.5, -0.5,   0.5, -0.5
  //]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  //var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  //if (a_Position < 0) {
  //  console.log('Failed to get the storage location of a_Position');
  //  return -1;
  //}
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  //gl.drawArrays(gl.TRIANGLES, 0, n);

  var uvBuffer = gl.createBuffer();
  if (!uvBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

  //var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  //if (a_Position < 0) {
  //  console.log('Failed to get the storage location of a_Position');
  //  return -1;
  //}
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_UV);

  gl.drawArrays(gl.TRIANGLES, 0, n);
  //return n;
}


class Triangle
{
    constructor()
    {
        this.type = "triangle";
        this.position = [0, 0, 0];
        this.color = [1, 1, 1, 1];
        this.size = 25;
        this.direction = "upright";

    }

    render()
    {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
        
        // var xy = g_points[i];
        // var rgba = g_colors[i];
        // var size = g_sizes[i];
        
        // Quit using the buffer to send the attribute
        //gl.disableVertexAttribArray(a_Position);

        // Pass the position of a point to a_Position variable
        //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the size of a point to u_Size variable
        gl.uniform1f(u_Size, size);

        // Draw
        var d = this.size/200;
        // if(this.direction == "upright")
        // {
        //   drawTriangle( [xy[0], xy[1], xy[0] + d, xy[1], xy[0] + d/2, xy[1] + d] );
        // }else
        // {
        //   drawTriangle( [xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d] )
        // }

        if (this.direction == "lu")
        { //left up pointing
          drawTriangle( [xy[0], xy[1], xy[0]-d, xy[1], xy[0], xy[1]+d] );
        } else if (this.direction == "ru") { //right up
          drawTriangle( [xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d] );
        } else if (this.direction == "dl") { //down left
          drawTriangle( [xy[0], xy[1], xy[0]-d, xy[1], xy[0], xy[1]-d] );
        } else if (this.direction == "dr") { // down right
          drawTriangle( [xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]-d] );
        } else if(this.direction == "upright"){
          // drawTriangle( [xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d] );
          // xy[0] += d;
          // xy[1] += d;
          // drawTriangle( [xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]-d] );
          drawTriangle( [xy[0], xy[1], xy[0]+d, xy[1], xy[0] + d/2, xy[1]+d] );
        }

    }
}
function drawTriangle3DUV(vertices, uv) {

  var n = vertices.length / 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  var uvBuffer = gl.createBuffer();
  if (!uvBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_UV);

  gl.drawArrays(gl.TRIANGLES, 0, n);
  //return n;
}

function drawTriangle3DUVNormal(vertices, uv, normals) {

  var n = vertices.length / 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  var uvBuffer = gl.createBuffer();
  if (!uvBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_UV);

  // Create a buffer object for normals
  var normalBuffer = gl.createBuffer();
  if (!normalBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Normal);

  gl.drawArrays(gl.TRIANGLES, 0, n);
  //return n;
}
