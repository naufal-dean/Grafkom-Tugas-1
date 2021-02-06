var gl;
var program;

window.onload = function() {
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

  // Create vertex shader
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  vertexShaderSource = document.getElementById("vertex-shader").text;

  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert("Failed to compile vertex shader");
  }

  // Attach vertex shader
  gl.attachShader(program, vertexShader);
  console.log(
    "Attached shader:",
    gl.getProgramParameter(program, gl.ATTACHED_SHADERS)
  );

  // Create fragment shader
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  fragmentShaderSource = document.getElementById("fragment-shader").text;

  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert("Failed to compile fragment shader");
  }

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
    console.log(gl.getShaderInfoLog(vertexShader))
    console.log(gl.getShaderInfoLog(fragmentShader))
    console.log(gl.getProgramInfoLog(program))
  }

  // Use program
  gl.useProgram(program);

  // Bind position buffer
  var vertices = [
    -1.0, -1.0,
    -0.5, 0.5,
    1.0, 1.0,
    0.5, -0.5,
  ];
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Associate shader position variable with data buffer
  var vPositionAttr = gl.getAttribLocation(program, "vPositionAttr");
  gl.vertexAttribPointer(vPositionAttr, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPositionAttr);

  // Bind color buffer
  const colors = [
    1.0,  0.0,  0.0,  1.0,
    0.0,  1.0,  0.0,  1.0,
    0.0,  0.0,  1.0,  1.0,
    1.0,  1.0,  1.0,  1.0,
  ];
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Associate shader color variable with data buffer
  var vColorAttr = gl.getAttribLocation(program, "vColorAttr");
  gl.vertexAttribPointer(vColorAttr, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColorAttr);

  // Render image
  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
