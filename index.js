var gl;
var program;

window.onload = function() {
  // Some variable declaration
  const defaultVertexColor = [1.0, 1.0, 1.0, 1.0];
  var vertexCount = 0;
  var vertices = [];
  var colors = [];

  // Get canvas
  canvas = document.getElementById("canvas");

  // Get webgl context
  gl = canvas.getContext("webgl");
  if (!gl) {
    alert("WebGL context not available");
  }

  // Setup webgl
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 1.0, 1.0, 1.0);

  // Create program
  program = gl.createProgram();

  // Load vertex shader
  const vertexShaderSource = document.getElementById("vertex-shader").text;
  const vertexShader = getShader(gl.VERTEX_SHADER, vertexShaderSource);
  // Attach vertex shader
  gl.attachShader(program, vertexShader);
  console.log(
    "Attached shader:",
    gl.getProgramParameter(program, gl.ATTACHED_SHADERS)
  );

  // Load fragment shader
  fragmentShaderSource = document.getElementById("fragment-shader").text;
  const fragmentShader = getShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
  // Attach fragment shader
  gl.attachShader(program, fragmentShader);
  console.log(
    "Attached shader:",
    gl.getProgramParameter(program, gl.ATTACHED_SHADERS)
  );

  // Link program
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert("Failed to link program");
  }

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
        const mGlCoord = getMouseGlCoordinate(e);
        addVertex(mGlCoord.x, mGlCoord.y);
      } else {
        // select vertex
        selectedVertexOffset = getVertexOffset(e, vertices);
      }
    } else {
      dragged = false;
    }
  }

  function mouseDownHandler(e) {
    draggedVertexOffset = getVertexOffset(e, vertices);
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
      const mGlCoord = getMouseGlCoordinate(e);
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
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCount);
    requestAnimationFrame(render);
  }

  // Call render
  render();
};

function getShader(type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("Failed to compile fragment shader");
    return null;
  }
  return shader;
}

// Helper functions
function getMouseGlCoordinate(e) {
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

function getVertexOffset(e, vertices) {
  // Select vertex (check from topmost vertex)
  const mGlCoord = getMouseGlCoordinate(e);
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
