"use strict";

const LINE_MODEL = "line";
const SQUARE_MODEL = "square";
const POLYGON_MODEL = "polygon";

function Model(drawMode, vertices, colors, vertexCount) {
  this.vertices = vertices;
  this.colors = colors;
  this.vertexCount = vertexCount;
  this.drawMode = drawMode;
}

function Line(drawMode, vertices, colors) {
  Model.call(this, vertices, colors, 2);
  this.type = LINE_MODEL;
}

function Square(drawMode, vertices, colors) {
  Model.call(this, vertices, colors, 4);
  this.type = SQUARE_MODEL;
}

function Polygon(drawMode, vertices, colors, vertexCount) {
  Model.call(this, vertices, colors, vertexCount);
  this.type = POLYGON_MODEL;
}
