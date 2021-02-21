"use strict";

window.onload = function() {
  // Some variable declaration
  const defaultVertexColor = [1.0, 1.0, 1.0, 1.0];
  var vertexCount = 0;
  var vertices = [];
  var colors = [];

  // Get canvas
  const canvas = document.getElementById("canvas");

  // Get webgl context
  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert("WebGL context not available");
    return;
  }

  // Setup webgl
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 1.0, 1.0, 1.0);

  // Create program
  const program = createProgram(gl);
  if (!program) return

  // Use program
  gl.useProgram(program);

  // Bind position buffer
  var positionBuffer = gl.createBuffer();
  setPositionBufferData();
  // Associate shader position variable with data buffer
  var vPositionAttr = gl.getAttribLocation(program, "vPositionAttr");
  gl.vertexAttribPointer(vPositionAttr, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPositionAttr);

  // Bind color buffer
  const colorBuffer = gl.createBuffer();
  setColorBufferData();
  // Associate shader color variable with data buffer
  var vColorAttr = gl.getAttribLocation(program, "vColorAttr");
  gl.vertexAttribPointer(vColorAttr, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColorAttr);

  // Set canvas event listener
  var selectedVertexOffset = -1;
  var draggedVertexOffset = -1;
  var dragged = false;

  function clickHandler(e) {
    if (!dragged) {
      if (document.getElementById("add-point").checked) {
        // add new point to polygon
        const mGlCoord = getMouseGlCoordinate(gl, e);
        addVertex(mGlCoord.x, mGlCoord.y);
      } else {
        // select vertex
        selectedVertexOffset = getVertexOffset(gl, e, vertices);
      }
    } else {
      dragged = false;
    }
  }

  function mouseDownHandler(e) {
    draggedVertexOffset = getVertexOffset(gl, e, vertices);
  }

  function mouseUpHandler(e) {
    draggedVertexOffset = -1;
  }

  function mouseOutHandler(e) {
    draggedVertexOffset = -1;
  }

  function mouseMoveHandler(e) {
    if (draggedVertexOffset != -1) {
      dragged = true;
      // Update vertex data
      const mGlCoord = getMouseGlCoordinate(gl, e);
      vertices[draggedVertexOffset] = mGlCoord.x;
      vertices[draggedVertexOffset+1] = mGlCoord.y;
      setPositionBufferData();
    }
  }

  canvas.addEventListener("click", clickHandler, false);

  canvas.addEventListener("mousedown", mouseDownHandler, false);
  canvas.addEventListener("mouseup", mouseUpHandler, false);
  canvas.addEventListener("mouseout", mouseOutHandler, false);
  canvas.addEventListener("mousemove", mouseMoveHandler, false);

  // Set save button listener
  document.getElementById("savebtn").addEventListener("click", function(e) {
    saveModel(vertices, colors, vertexCount);
  }, false);

  // Set load button listener
  document.getElementById("loadbtn").addEventListener("click", function(e) {
    loadModel("loadfile", function(unpacked) {
      [vertices, colors, vertexCount] = unpacked;
      setPositionBufferData();
      setColorBufferData();
    });
  }, false);

  // Modify vertex and color helpers
  function addVertex(x, y) {
    vertexCount++;
    vertices.push(x, y);
    colors.push(...defaultVertexColor)  // Use default vertex color
    setPositionBufferData();
    setColorBufferData();
  }

  // Render helpers
  function setPositionBufferData() {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  }

  function setColorBufferData() {
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
  }

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexCount);
    requestAnimationFrame(render);
  }

  // Call render
  render();
};
