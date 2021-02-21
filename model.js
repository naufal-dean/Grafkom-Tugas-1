"use strict";

const LINE_MODEL = "line";
const SQUARE_MODEL = "square";
const POLYGON_MODEL = "polygon";

const DEFAULT_VERTEX_COLOR = [1.0, 1.0, 1.0, 1.0];

function Model(drawMode, vertices = [], colors = [], vertexCount = 0) {
  this.vertices = vertices;
  this.colors = colors;
  this.vertexCount = vertexCount;
  this.drawMode = drawMode;
}

function Line(drawMode, vertices = [], colors = []) {
  Model.call(this, drawMode, vertices, colors, 2);
  this.type = LINE_MODEL;
}

function Square(drawMode, vertices = [], colors = []) {
  Model.call(this, drawMode, vertices, colors, 4);
  this.type = SQUARE_MODEL;
}

function Polygon(drawMode, vertices = [], colors = [], vertexCount = 0) {
  Model.call(this, drawMode, vertices, colors, vertexCount);
  this.type = POLYGON_MODEL;
}
