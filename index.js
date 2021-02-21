"use strict";

window.onload = function() {
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
  if (!program) return;

  // Use program
  gl.useProgram(program);

  // Models array
  var vertices1 = [
    0.0, 0.0,
    0.0, 0.5,
    0.5, 0.0,
  ];
  var colors1 = [
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
  ];
  var vertices2 = [
    0.0, 0.0,
    0.0, -0.5,
    -0.5, 0.0,
  ];
  var colors2 = [
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
  ];
  var models = [
    new Polygon(gl.TRIANGLE_FAN, vertices1, colors1, 3),
    new Polygon(gl.TRIANGLE_FAN, vertices2, colors2, 3)
  ];

  // Create position and color buffer
  var positionBuffer = gl.createBuffer();
  var colorBuffer = gl.createBuffer();

  // Bind position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Associate shader position variable with data buffer
  const vPositionAttr = gl.getAttribLocation(program, "vPositionAttr");
  gl.vertexAttribPointer(vPositionAttr, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPositionAttr);

  // Bind color buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  // Associate shader color variable with data buffer
  const vColorAttr = gl.getAttribLocation(program, "vColorAttr");
  gl.vertexAttribPointer(vColorAttr, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColorAttr);


  // Set canvas event listener
  var selectedModel = null;
  var selectedVertexOffset = -1;
  var draggedModel = null;
  var draggedVertexOffset = -1;
  var dragged = false;

  function clickHandler(e) {
    if (!dragged) {
      if (document.getElementById("add-point").checked) {
        // add new point to polygon
        const mGlCoord = getMouseGlCoordinate(gl, e);
        // addVertex(mGlCoord.x, mGlCoord.y);
      } else {
        // select vertex
        [selectedModel, selectedVertexOffset] = getVertexOffset(gl, e, models);
      }
    } else {
      dragged = false;
    }
  }

  function mouseDownHandler(e) {
    [draggedModel, draggedVertexOffset] = getVertexOffset(gl, e, models);
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
      draggedModel.vertices[draggedVertexOffset] = mGlCoord.x;
      draggedModel.vertices[draggedVertexOffset+1] = mGlCoord.y;
      setPositionBufferData(draggedModel);
    }
  }

  canvas.addEventListener("click", clickHandler, false);

  canvas.addEventListener("mousedown", mouseDownHandler, false);
  canvas.addEventListener("mouseup", mouseUpHandler, false);
  canvas.addEventListener("mouseout", mouseOutHandler, false);
  canvas.addEventListener("mousemove", mouseMoveHandler, false);

  // Set save button listener
  document.getElementById("savebtn").addEventListener("click", function(e) {
    saveModels(models);
  }, false);

  // Set load button listener
  document.getElementById("loadbtn").addEventListener("click", function(e) {
    loadModels("loadfile", function(loadedModels) {
      models = loadedModels;
    });
  }, false);

  // Modify vertex and color helpers
  function addVertex(model, x, y) {
    vertexCount++;
    vertices.push(x, y);
    colors.push(...DEFAULT_VERTEX_COLOR) // Use default vertex color
    setPositionBufferData(model);
    setColorBufferData(model);
  }

  // Render helpers
  function setPositionBufferData(model) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.DYNAMIC_DRAW);
  }

  function setColorBufferData(model) {
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.colors), gl.DYNAMIC_DRAW);
  }

  function render() {
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw model
    models.forEach(function(model) {
      setPositionBufferData(model);
      setColorBufferData(model);
      gl.drawArrays(model.drawMode, 0, model.vertexCount);
    });

    // Request next frame
    requestAnimationFrame(render);
  }

  // Call render
  render();
};
