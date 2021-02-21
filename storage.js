"use strict";

function saveModel(vertices, colors, vertexCount) {
  // Pack datas
  const packed = packModel(vertices, colors, vertexCount)

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

function loadModel(filesInputId, resultCallback) {
  var unpacked;
  // Get file object
  const files = document.getElementById(filesInputId).files;
  if (files.length == 0) {
    alert("No file selected!"); return;
  }
  const file = files[0];
  // Create reader object
  const reader = new FileReader();
  reader.onload = (function(f) {
    return function(e) {
      unpacked = unpackModel(e.target.result);
      resultCallback(unpacked);
    };
  })(file);
  // Read file
  reader.readAsText(file);
}

// Helper function to pack model to string, vice versa
function packModel(vertices, colors, vertexCount) {
  var res = ""
  // Data len
  res += vertexCount + "\n";
  // Datas
  for (var i = 0; i < vertexCount; i++) {
    const i2 = i * 2;
    res += vertices[i2] + " " + vertices[i2 + 1] + "\n";
  }
  for (var i = 0; i < vertexCount; i++) {
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
  const vertexCount = parseInt(lines[0])
  // Read vertice data
  var vertices = [];
  for (var i = 1; i < 1 + vertexCount; i++) {
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
  for (var i = 1 + vertexCount; i < 1 + (vertexCount * 2); i++) {
    // Parse coordinates from data line
    const rgba = lines[i].split(" ");
    if (rgba.length != 4) {
      alert("Malformed input data");
      return null;
    }
    colors.push(parseFloat(rgba[0]), parseFloat(rgba[1]), parseFloat(rgba[2]), parseFloat(rgba[3]));
  }
  // Return
  return [vertices, colors, vertexCount];
}
