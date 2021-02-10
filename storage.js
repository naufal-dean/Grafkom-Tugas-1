function saveModel(vertices, colors) {
  // Pack datas
  const packed = packModel(vertices, colors)

  // Create a tag with download attribute
  var temp = document.createElement("a");
  temp.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(packed)
  );
  temp.setAttribute("download", "model");

  // Hide temp element
  temp.style.display = "none";

  // Briefly add temp to document and click the element to initiate download
  document.body.appendChild(temp);
  temp.click();
  document.body.removeChild(temp);
}

function loadModel() {

}

// Helper function to pack model to string, vice versa
function packModel(vertices, colors) {
  const dataLen = Math.min(
    Math.floor(vertices.length / 2), // x, y
    Math.floor(colors.length / 4) // r, g, b, a
  );

  var res = ""
  // Data len
  res += dataLen + "\n";
  // Datas
  for (var i = 0; i < dataLen; i++) {
    const i2 = i * 2;
    res += vertices[i2] + " " + vertices[i2 + 1] + "\n";
  }
  for (var i = 0; i < dataLen; i++) {
    const i4 = i * 4;
    res += colors[i4] + " " + colors[i4 + 1] + " " + colors[i4 + 2] + " " + colors[i4 + 3] + "\n";
  }
  // Return
  return res;
}

function unpackModel() {

}
