"use strict";

/*
 * WebGL helpers function
 * @createProgram
 * @getShader
 */

function createProgram(gl) {
  // Create program
  const program = gl.createProgram();

  // Load vertex shader
  const vertexShaderSource = document.getElementById("vertex-shader").text;
  const vertexShader = getShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  if (!vertexShader) return null;
  // Attach vertex shader
  gl.attachShader(program, vertexShader);

  // Load fragment shader
  const fragmentShaderSource = document.getElementById("fragment-shader").text;
  const fragmentShader = getShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!fragmentShader) return null;
  // Attach fragment shader
  gl.attachShader(program, fragmentShader);

  // Link program
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert("Failed to link program");
    return null;
  }

  // Succeed
  return program;
}

function getShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("Failed to compile fragment shader");
    return null;
  }
  return shader;
}


/*
 * Coordinate helpers function
 * @getMouseGlCoordinate
 * @getVertexOffset
 * @vertexInRange
 */

function getMouseGlCoordinate(gl, e) {
  // Get mouse coordinate relative to canvas
  // Assumption: canvas.height == canvas.clientHeight and canvas.width == canvas.clientWidth
  const rect = canvas.getBoundingClientRect();
  posX = e.clientX - rect.left;
  posY = e.clientY - rect.top;
  // Convert to webgl coordinate
  glX = posX / gl.canvas.width * 2 - 1;
  glY = posY / gl.canvas.height * (-2) + 1;
  // Return
  return {
    x: glX,
    y: glY
  };
}

function getVertexOffset(gl, e, vertices) {
  // Select vertex (check from topmost vertex)
  const mGlCoord = getMouseGlCoordinate(gl, e);
  for (var i = vertices.length - 2; i >= 0 ; i -= 2) {
    if (vertexInRange(mGlCoord, { x: vertices[i], y: vertices[i+1] })) {
      return i;
    }
  }
  // Return -1 if no vertex in mouse range
  return -1;
}

function vertexInRange(mGlCoord, vGlCoord) {
  // Create vertex area lower and upper bound
  lowerX = (vGlCoord.x > -0.9) ? (vGlCoord.x - 0.1) : (-1.0);
  lowerY = (vGlCoord.y > -0.9) ? (vGlCoord.y - 0.1) : (-1.0);
  upperX = (vGlCoord.x < 0.9) ? (vGlCoord.x + 0.1) : (1.0);
  upperY = (vGlCoord.y < 0.9) ? (vGlCoord.y + 0.1) : (1.0);
  // Return true if mouse inside vertex area, otherwise false
  return (
    lowerX < mGlCoord.x && mGlCoord.x < upperX &&
    lowerY < mGlCoord.y && mGlCoord.y < upperY
  );
}
