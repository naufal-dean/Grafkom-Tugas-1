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
 * @getSquareModelClicked
 */

function getMouseGlCoordinate(gl, e) {
  // Get mouse coordinate relative to canvas
  // Assumption: canvas.height == canvas.clientHeight and canvas.width == canvas.clientWidth
  const rect = canvas.getBoundingClientRect();
  const posX = e.clientX - rect.left;
  const posY = e.clientY - rect.top;
  // Convert to webgl coordinate
  const glX = posX / gl.canvas.width * 2 - 1;
  const glY = posY / gl.canvas.height * (-2) + 1;
  // Return
  return {
    x: glX,
    y: glY
  };
}

function getVertexOffset(gl, e, models) {
  // Select vertex (check from topmost vertex)
  const mGlCoord = getMouseGlCoordinate(gl, e);
  // Iterate from last object
  for (var i = models.length - 1; i >= 0 ; i--) {
    // Iterate from last vertex
    const vertices = models[i].vertices;
    for (var j = vertices.length - 2; j >= 0; j -= 2) {
      if (vertexInRange(mGlCoord, { x: vertices[j], y: vertices[j+1] })) {
        return [models[i], j];
      }
    }
  }
  // Return -1 if no vertex in mouse range
  return [null, -1];
}

function vertexInRange(mGlCoord, vGlCoord) {
  // Create vertex area lower and upper bound
  const lowerX = (vGlCoord.x > -0.9) ? (vGlCoord.x - 0.1) : (-1.0);
  const lowerY = (vGlCoord.y > -0.9) ? (vGlCoord.y - 0.1) : (-1.0);
  const upperX = (vGlCoord.x < 0.9) ? (vGlCoord.x + 0.1) : (1.0);
  const upperY = (vGlCoord.y < 0.9) ? (vGlCoord.y + 0.1) : (1.0);
  // Return true if mouse inside vertex area, otherwise false
  return (
    lowerX < mGlCoord.x && mGlCoord.x < upperX &&
    lowerY < mGlCoord.y && mGlCoord.y < upperY
  );
}

function getSquareModelClicked(gl, e, models) {
  // Select vertex (check from topmost vertex)
  const mGlCoord = getMouseGlCoordinate(gl, e);
  // Iterate from last object
  for (var i = models.length - 1; i >= 0 ; i--) {
    if (models[i].type === SQUARE_MODEL) {
      if (squareInRange(mGlCoord, models[i])) {
        return models[i];
      }
    }
  }
  // Return null if no model in mouse range
  return null;
}

function getLineModelClicked(gl, e, models) {
  // Select vertex (check from topmost vertex)
  const mGlCoord = getMouseGlCoordinate(gl, e);
  // Iterate from last object
  for (var i = models.length - 1; i >= 0 ; i--) {
    if (models[i].type === LINE_MODEL) {
      if (lineInRange(mGlCoord, models[i])) {
        return models[i];
      }
    }
  }
  // Return null if no model in mouse range
  return null;
}

function squareInRange(mGlCoord, squareModel) {
  // Create square area lower and upper bound
  const lowerX = Math.min(squareModel.vertices[0], squareModel.vertices[4]);
  const lowerY = Math.min(squareModel.vertices[1], squareModel.vertices[5]);
  const upperX = Math.max(squareModel.vertices[0], squareModel.vertices[4]);
  const upperY = Math.max(squareModel.vertices[1], squareModel.vertices[5]);
  // Return true if mouse inside vertex area, otherwise false
  return (
    lowerX < mGlCoord.x && mGlCoord.x < upperX &&
    lowerY < mGlCoord.y && mGlCoord.y < upperY
  );
}

function lineInRange(mGlCoord, lineModel) {
  const gradient = (lineModel.vertices[3] - lineModel.vertices[1]) / (lineModel.vertices[2] - lineModel.vertices[0]);
  const constant = lineModel.vertices[1] - (gradient * lineModel.vertices[0]);
  const upperX = Math.max(lineModel.vertices[0], lineModel.vertices[2]) + 0.1;
  const lowerX = Math.min(lineModel.vertices[0], lineModel.vertices[2]) - 0.1;
  const upperY = (gradient * mGlCoord.x) + constant + 0.1;
  const lowerY = (gradient * mGlCoord.x) + constant - 0.1;
  // Return true if mouse inside line area, otherwise false
  return (
    lowerX < mGlCoord.x && mGlCoord.x < upperX &&
    lowerY < mGlCoord.y && mGlCoord.y < upperY
  );
}
