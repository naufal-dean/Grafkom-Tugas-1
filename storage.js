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

function loadModel(data) {
  console.log(data);
}

// Helper function to pack model to string, vice versa
function packModel(vertices, colors) {
  if (Math.floor(vertices.length / 2) != Math.floor(colors.length / 4)) {
    alert("Vertices and colors array length mismatch");
    return null;
  }
  const dataLen = Math.floor(vertices.length / 2);

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

function unpackModel(data) {
  // Read data, and filter empty string
  const lines = data.split("\n").filter(line => line);
  // Get data len
  const dataLen = parseInt(lines[0])
  // Read vertice data
  var vertices = [];
  for (var i = 1; i < 1 + dataLen; i++) {
    // Parse coordinates from data line
    const coord = lines[i].split(" ");
    if (coord.length != 2) {
      alert("Malformed input data");
      return null;
    }
    vertices.push(parseFloat(coord[0]), parseFloat(coord[1]));
  }
  // Read color data
  var colors = [];
  for (var i = 1 + dataLen; i < 1 + (dataLen * 2); i++) {
    // Parse coordinates from data line
    const rgba = lines[i].split(" ");
    if (rgba.length != 4) {
      alert("Malformed input data");
      return null;
    }
    colors.push(parseFloat(rgba[0]), parseFloat(rgba[1]), parseFloat(rgba[2]), parseFloat(rgba[3]));
  }
  // Return
  return [vertices, colors];
}
