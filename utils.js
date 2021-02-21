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
