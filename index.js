"use strict";

const MODEL_INPUT_NONE = "drag";
const MODEL_INPUT_LINE = "line";
const MODEL_INPUT_SQUARE = "square";
const MODEL_INPUT_POLYGON = "polygon";
const MODEL_INPUT_COLOR = "color";
const MODEL_INPUT_CHANGE_SQUARE_SIZE = "change-square-size";

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
  var draggedModel = null;
  var draggedVertexOffset = -1;
  var selectedSquareModel = null;

  var modelInput = MODEL_INPUT_NONE;
  var isMouseDown = false;
  var dragged = false;

  var polygonModelCreated = false;

  function clickHandler(e) {
    if (!dragged) {
      if (modelInput === MODEL_INPUT_POLYGON) {
        drawPolygonMouseClickHelper(e);
      } else if (modelInput === MODEL_INPUT_COLOR) {
        changeColorMouseClickHelper(e);
      } else if (modelInput === MODEL_INPUT_CHANGE_SQUARE_SIZE) {
        changeSquareSizeMouseClickHelper(e);
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
      dragVertexMouseMoveHelper(e);
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
      draggedModel = null;
      draggedVertexOffset = -1;
      selectedSquareModel = null;
      polygonModelCreated = false;
    }, false);
  }

  // Set change square size slider listener
  document.getElementById("square-size-slider").addEventListener("input", function(e) {
    if (selectedSquareModel) {
      const vertices = selectedSquareModel.vertices;
      // Convert length percentage (max 100) to length in gl (max 2)
      // Limit min slider value to 1, because when the size is 0, the orientation is ambiguous
      const sideLength = (Math.max(this.value, 1) * 2) / 100;
      const halfSideLength = sideLength / 2;
      // Get center of the square
      const centerX = (vertices[0] + vertices[4]) / 2;
      const centerY = (vertices[1] + vertices[5]) / 2;
      // Get new pos for vertex 0 and vertex 2
      const v2InRightModifier = (vertices[4] > centerX) ? 1 : -1;
      const v2InTopModifier = (vertices[5] > centerY) ? 1 : -1;
      const newPosV0 = {
        x: centerX - (v2InRightModifier * halfSideLength),
        y: centerY - (v2InTopModifier * halfSideLength)
      };  // vertex 0
      const newPosV2 = {
        x: centerX + (v2InRightModifier * halfSideLength),
        y: centerY + (v2InTopModifier * halfSideLength)
      };  // vertex 2
      // Update square size relative to the center
      vertices[0] = newPosV0.x;
      vertices[1] = newPosV0.y;
      vertices[2] = newPosV0.x;
      vertices[3] = newPosV2.y;
      vertices[4] = newPosV2.x;
      vertices[5] = newPosV2.y;
      vertices[6] = newPosV2.x;
      vertices[7] = newPosV0.y;
      // Set buffer data
      setPositionBufferData(selectedSquareModel);
    }
  }, false);


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
    const vertices = [mGlCoord.x, mGlCoord.y, mGlCoord.x, mGlCoord.y, mGlCoord.x, mGlCoord.y, mGlCoord.x, mGlCoord.y];
    var VERTEX_COLOR = getColor();
    const colors = [...VERTEX_COLOR, ...VERTEX_COLOR, ...VERTEX_COLOR, ...VERTEX_COLOR];
    var newModel = new Square(gl.TRIANGLE_FAN, vertices, colors);
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
      model.vertices[2] = origin.x;
      model.vertices[3] = target.y;
      model.vertices[4] = target.x;
      model.vertices[5] = target.y;
      model.vertices[6] = target.x;
      model.vertices[7] = origin.y;
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

  function dragVertexMouseMoveHelper(e) {
    if (isMouseDown) {
      if (draggedVertexOffset != -1) {  // any vertex selected
        if (draggedModel.type === SQUARE_MODEL) {
          const mGlCoord = getMouseGlCoordinate(gl, e);
          const vertices = draggedModel.vertices;
          // Get origin point (opposite to the clicked vertex)
          const origin = {
            x: vertices[(draggedVertexOffset + 4) % 8],
            y: vertices[(draggedVertexOffset + 5) % 8]
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
          // Update dragged vertex
          vertices[draggedVertexOffset] = target.x;
          vertices[draggedVertexOffset + 1] = target.y;
          //  Update dragged vertex neighbour
          if (draggedVertexOffset == 0) {
            // vertex 0 dragged
            vertices[2] = target.x;
            vertices[7] = target.y;
          } else if (draggedVertexOffset == 2) {
            // vertex 1 dragged
            vertices[0] = target.x;
            vertices[5] = target.y;
          } else if (draggedVertexOffset == 4) {
            // vertex 2 dragged
            vertices[6] = target.x;
            vertices[3] = target.y;
          } else if (draggedVertexOffset == 6) {
            // vertex 3 dragged
            vertices[4] = target.x;
            vertices[1] = target.y;
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

  function changeColorMouseClickHelper(e) {
    const [clickedModel, clickedVertexOffset] = getVertexOffset(gl, e, models);
    // Change the color of selected vertex
    if (clickedVertexOffset != -1) {
      var newColor = getColor();
      var j = 0;
      for (i = (clickedVertexOffset * 2); i < 4 + (clickedVertexOffset * 2); i++) {
        clickedModel.colors[i] = newColor[j];
        j++;
      }
      setColorBufferData(clickedModel);
    }
  }

  function changeSquareSizeMouseClickHelper(e) {
    selectedSquareModel = getSquareModelClicked(gl, e, models);
    if (selectedSquareModel) {  // Any square selected
      const sideLength = Math.abs(selectedSquareModel.vertices[0] - selectedSquareModel.vertices[4]);
      // Convert length in gl (max 2) to percentage (max 100)
      const sliderVal = (sideLength * 100) / 2;
      document.getElementById("square-size-slider").value = String(sliderVal);
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
