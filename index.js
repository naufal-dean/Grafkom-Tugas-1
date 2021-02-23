"use strict";

const MODEL_INPUT_NONE = "none";
const MODEL_INPUT_LINE = "line";
const MODEL_INPUT_SQUARE = "square";
const MODEL_INPUT_POLYGON = "polygon";
const MODEL_INPUT_COLOR = "color";

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

  var modelInput = MODEL_INPUT_NONE;
  var isMouseDown = false;
  var dragged = false;

  var polygonModelCreated = false;

  function clickHandler(e) {
    if (!dragged) {
      if (modelInput === MODEL_INPUT_POLYGON) {
        drawPolygonMouseClickHelper(e);
      } else if (modelInput === MODEL_INPUT_COLOR) {
        [selectedModel, selectedVertexOffset] = getVertexOffset(gl, e, models);
      }
    } else {
      dragged = false;
    }
  }

  function mouseDownHandler(e) {
    isMouseDown = true;

    if (modelInput === MODEL_INPUT_LINE) {
      drawLineMouseDownHelper(e);
    } else if (modelInput === MODEL_INPUT_SQUARE) {
      drawSquareMouseDownHelper(e);
    } else if (modelInput === MODEL_INPUT_NONE) {
      [draggedModel, draggedVertexOffset] = getVertexOffset(gl, e, models);
    }

  }

  function mouseUpHandler(e) {
    isMouseDown = false;

    if (modelInput === MODEL_INPUT_NONE) {
      draggedModel = null;
      draggedVertexOffset = -1;
    }
  }

  function mouseOutHandler(e) {
    // Simulate mouse up when cursor out of canvas
    isMouseDown = false;

    if (modelInput === MODEL_INPUT_NONE) {
      draggedModel = null;
      draggedVertexOffset = -1;
    }
  }

  function mouseMoveHandler(e) {
    // Set dragged flag to true if mouse down then move
    if (isMouseDown)
      dragged = true;

    if (modelInput === MODEL_INPUT_LINE) {
      drawLineMouseMoveHelper(e);
    } else if (modelInput === MODEL_INPUT_SQUARE) {
      drawSquareMouseMoveHelper(e);
    } else if (modelInput === MODEL_INPUT_NONE) {
      noInputMouseMoveHelper(e);
    } else if (modelInput === MODEL_INPUT_COLOR) {
      changeColorMouseMoveHelper();
    }
  }

  canvas.addEventListener("click", clickHandler, false);

  canvas.addEventListener("mousedown", mouseDownHandler, false);
  canvas.addEventListener("mouseup", mouseUpHandler, false);
  canvas.addEventListener("mouseout", mouseOutHandler, false);
  canvas.addEventListener("mousemove", mouseMoveHandler, false);

  // Set model input radio listener
  const modelInputRadio = document.getElementsByName("model-input");
  for (var i = 0; i < modelInputRadio.length; i++) {
    modelInputRadio[i].addEventListener("change", function() {
      if (this.value !== modelInput)
        modelInput = this.value;
      // Reset some variables
      selectedModel = null;
      selectedVertexOffset = -1;
      draggedModel = null;
      draggedVertexOffset = -1;
      polygonModelCreated = false;
    }, false);
  }

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

  // Draw model helpers
  function drawLineMouseDownHelper(e) {
    // Create new model
    const mGlCoord = getMouseGlCoordinate(gl, e);
    const vertices = [mGlCoord.x, mGlCoord.y, mGlCoord.x, mGlCoord.y];
    var VERTEX_COLOR = getColor();
    var newModel = new Line(gl.LINES, vertices, [...VERTEX_COLOR, ...VERTEX_COLOR]);
    models.push(newModel);
  }

  function drawLineMouseMoveHelper(e) {
    if (isMouseDown) {
      // Continue to draw the line by dragging from initial point
      const mGlCoord = getMouseGlCoordinate(gl, e);
      const model = models[models.length - 1];
      model.vertices[2] = mGlCoord.x;
      model.vertices[3] = mGlCoord.y;
      setPositionBufferData(model);
    }
  }

  function drawSquareMouseDownHelper(e) {
    // Create new model
    const mGlCoord = getMouseGlCoordinate(gl, e);
    const vertices = [mGlCoord.x, mGlCoord.y, mGlCoord.x, mGlCoord.y, mGlCoord.x, mGlCoord.y, mGlCoord.x, mGlCoord.y, mGlCoord.x, mGlCoord.y, mGlCoord.x, mGlCoord.y];
    var VERTEX_COLOR = getColor();
    const colors = [...VERTEX_COLOR, ...VERTEX_COLOR, ...VERTEX_COLOR, ...VERTEX_COLOR, ...VERTEX_COLOR, ...VERTEX_COLOR];
    var newModel = new Square(gl.TRIANGLES, vertices, colors);
    models.push(newModel);
  }

  function drawSquareMouseMoveHelper(e) {
    if (isMouseDown) {
      // Continue to draw the line by dragging from initial point
      const mGlCoord = getMouseGlCoordinate(gl, e);
      // Get model that is currently drawed
      const model = models[models.length - 1];
      // Get drag origin coordinate
      const origin = {
        x: model.vertices[0],
        y: model.vertices[1]
      };
      // Calculate target coordinate (opposite direction with the origin point)
      const sideLength = Math.max(
        Math.abs(mGlCoord.x - origin.x),
        Math.abs(mGlCoord.y - origin.y)
      );
      const xDirection = (mGlCoord.x > origin.x) ? 1 : -1; // if true, mouse is in right of origin point
      const yDirection = (mGlCoord.y > origin.y) ? 1 : -1; // if true, mouse is in above of origin point
      const target = {
        x: origin.x + (sideLength * xDirection),
        y: origin.y + (sideLength * yDirection)
      };
      // Update model vertices
      model.vertices[2] = target.x;
      model.vertices[3] = origin.y;
      model.vertices[4] = origin.x;
      model.vertices[5] = target.y;
      model.vertices[6] = target.x;
      model.vertices[7] = origin.y;
      model.vertices[8] = origin.x;
      model.vertices[9] = target.y;
      model.vertices[10] = target.x;
      model.vertices[11] = target.y;
      // Set buffer data
      setPositionBufferData(model);
    }
  }

  function drawPolygonMouseClickHelper(e) {
    // Create new model if not already created in this input session
    var newModel;
    if (!polygonModelCreated) {
      newModel = new Polygon(gl.TRIANGLE_FAN, [], [], 0);
      models.push(newModel);
      polygonModelCreated = true;
    } else {
      newModel = models[models.length - 1];
    }
    // Add new vertex
    const mGlCoord = getMouseGlCoordinate(gl, e);
    newModel.vertices.push(mGlCoord.x, mGlCoord.y);
    var VERTEX_COLOR = getColor();
    newModel.colors.push(...VERTEX_COLOR);
    newModel.vertexCount++;
    // Set buffer data
    setPositionBufferData(newModel);
  }

  function noInputMouseMoveHelper(e) {
    if (isMouseDown) {
      if (draggedVertexOffset != -1) {  // any vertex selected
        if (draggedModel.type === MODEL_INPUT_SQUARE) {
          const mGlCoord = getMouseGlCoordinate(gl, e);
          const model = draggedModel[models.length - 1];
          const origin = {
            x: draggedModel.vertices[0],
            y: draggedModel.vertices[1]
          };
          // Calculate target coordinate (opposite direction with the origin point)
          const sideLength = Math.max(
            Math.abs(mGlCoord.x - origin.x),
            Math.abs(mGlCoord.y - origin.y)
          );
          const xDirection = (mGlCoord.x > origin.x) ? 1 : -1; // if true, mouse is in right of origin point
          const yDirection = (mGlCoord.y > origin.y) ? 1 : -1; // if true, mouse is in above of origin point
          const target = {
            x: origin.x + (sideLength * xDirection),
            y: origin.y + (sideLength * yDirection)
          };
          console.log(draggedVertexOffset)
          // Update model vertices
          if ((draggedVertexOffset == 0) || (draggedVertexOffset == 10)) {
            draggedModel.vertices[draggedVertexOffset] = target.x;
            draggedModel.vertices[draggedVertexOffset + 1] = target.y;

          }
          // Set buffer data
          setPositionBufferData(draggedModel);
        } else {
          // Update vertex data
          const mGlCoord = getMouseGlCoordinate(gl, e);
          draggedModel.vertices[draggedVertexOffset] = mGlCoord.x;
          draggedModel.vertices[draggedVertexOffset + 1] = mGlCoord.y;
          setPositionBufferData(draggedModel);
        }
      }
    }
  }

  function changeColorMouseMoveHelper() {
    if (!isMouseDown) {
      if (selectedVertexOffset != -1) {  // any vertex selected
        var VERTEX_COLOR = getColor();
        if (selectedModel.type === MODEL_INPUT_LINE) {
          selectedModel.colors = [...VERTEX_COLOR, ...VERTEX_COLOR];
        }
        else if (selectedModel.type === MODEL_INPUT_POLYGON) {
          selectedModel.colors = [...VERTEX_COLOR, ...VERTEX_COLOR, ...VERTEX_COLOR];
        }
        else if (selectedModel.type === MODEL_INPUT_SQUARE) {
          selectedModel.colors = [...VERTEX_COLOR, ...VERTEX_COLOR, ...VERTEX_COLOR, ...VERTEX_COLOR, ...VERTEX_COLOR, ...VERTEX_COLOR];
        }
        setColorBufferData(selectedModel);
      }
    }
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
