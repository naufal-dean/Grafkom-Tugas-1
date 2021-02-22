"use strict";

const LINE_MODEL = "line";
const SQUARE_MODEL = "square";
const POLYGON_MODEL = "polygon";

const DEFAULT_VERTEX_COLOR = [1.0, 1.0, 1.0, 1.0];

// Model object
function Model(drawMode, type, vertices = [], colors = [], vertexCount = 0) {
  this.drawMode = drawMode;
  this.type = type;
  this.vertices = vertices;
  this.colors = colors;
  this.vertexCount = vertexCount;
}

Model.prototype.pack = function() {
  var res = ""
  // Line count in packed representation, including this line
  res += (4 + (this.vertexCount * 2)) + "\n";
  // drawMode, type, vertexCount
  res += this.drawMode + "\n";
  res += this.type + "\n";
  res += this.vertexCount + "\n";
  // Datas
  for (var i = 0; i < this.vertexCount; i++) {
    const i2 = i * 2;
    res += this.vertices[i2] + " " + this.vertices[i2 + 1] + "\n";
  }
  for (var i = 0; i < this.vertexCount; i++) {
    const i4 = i * 4;
    const colors = this.colors;
    res += colors[i4] + " " + colors[i4 + 1] + " " + colors[i4 + 2] + " " + colors[i4 + 3] + "\n";
  }
  // Return
  return res;
}

Model.prototype.unpack = function(lines) {
  // Get models count
  this.drawMode = parseInt(lines[1]);
  this.type = lines[2];
  this.vertexCount = parseInt(lines[3]);
  // Read vertice data
  this.vertices = [];
  for (var i = 4; i < 4 + this.vertexCount; i++) {
    // Parse coordinates from data line
    const coord = lines[i].split(" ");
    if (coord.length != 2) {
      alert("Malformed input data");
      return null;
    }
    this.vertices.push(parseFloat(coord[0]), parseFloat(coord[1]));
  }
  // Read color data
  this.colors = [];
  for (var i = 4 + this.vertexCount; i < 4 + (this.vertexCount * 2); i++) {
    // Parse coordinates from data line
    const rgba = lines[i].split(" ");
    if (rgba.length != 4) {
      alert("Malformed input data");
      return null;
    }
    this.colors.push(parseFloat(rgba[0]), parseFloat(rgba[1]), parseFloat(rgba[2]), parseFloat(rgba[3]));
  }
}

// Line object
function Line(drawMode, vertices = [], colors = []) {
  Model.call(this, drawMode, LINE_MODEL, vertices, colors, 2);
}
Line.prototype = new Model();
Line.prototype.constructor = Line;

// Square object
function Square(drawMode, vertices = [], colors = []) {
  Model.call(this, drawMode, SQUARE_MODEL, vertices, colors, 6);
}
Square.prototype = new Model();
Square.prototype.constructor = Square;

// Polygon object
function Polygon(drawMode, vertices = [], colors = [], vertexCount = 0) {
  Model.call(this, drawMode, POLYGON_MODEL, vertices, colors, vertexCount);
}
Polygon.prototype = new Model();
Polygon.prototype.constructor = Polygon;
