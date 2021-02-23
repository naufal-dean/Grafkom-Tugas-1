"use strict";

function getColor() {
  var hex = document.getElementById("change-color-input").value;
  var R = parseInt(hexToRgb(hex)[1], 16) / 255;
  var G = parseInt(hexToRgb(hex)[2], 16) / 255;
  var B = parseInt(hexToRgb(hex)[3], 16) / 255;
  return [R, G, B, 1.0];
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result;
}
