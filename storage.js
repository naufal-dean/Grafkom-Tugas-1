"use strict";

function saveModels(models) {
  // Pack models
  var data = "";
  // Models count
  data += models.length + "\n";
  // Packed models representation
  models.forEach(function(model) {
    data += model.pack();
  });

  // Create a tag with download attribute
  var temp = document.createElement("a");
  temp.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(data)
  );
  temp.setAttribute("download", "model");

  // Hide temp element
  temp.style.display = "none";

  // Briefly add temp to document and click the element to initiate download
  document.body.appendChild(temp);
  temp.click();
  document.body.removeChild(temp);
}

function loadModels(filesInputId, resultCallback) {
  var unpacked;
  // Get file object
  const files = document.getElementById(filesInputId).files;
  if (files.length == 0) {
    alert("No file selected!");
    return;
  }
  const file = files[0];
  // Create reader object
  const reader = new FileReader();
  reader.onload = (function(f) {
    return function(e) {
      const data = e.target.result;

      // Split data, and filter empty string
      const lines = data.split("\n").filter(line => line);

      // Get model count
      const modelCount = parseInt(lines[0]);

      // Unpack models
      var models = [];
      var offset = 1;  // current lines index offset
      for (var i = 0; i < modelCount; i++) {
        // Get line count for next model representation
        const lineCount = parseInt(lines[offset]);
        // Unpack model
        var model = new Model();
        model.unpack(lines.slice(offset, offset + lineCount));
        models.push(model);
        // Update offset
        offset += lineCount;
      }

      // Return result to main program
      resultCallback(models);
    };
  })(file);
  // Read file
  reader.readAsText(file);
}
