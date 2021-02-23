"use strict";

const BG_COLOR_INPUT = "bg-color-input";
const DEFAULT_COLOR_INPUT = "default-color-input";
const CHANGE_COLOR_INPUT = "change-color-input";

function getColor(colorInputId) {
  var hex = document.getElementById(colorInputId).value;
  var R = parseInt(hexToRgb(hex)[1], 16) / 255;
  var G = parseInt(hexToRgb(hex)[2], 16) / 255;
  var B = parseInt(hexToRgb(hex)[3], 16) / 255;
  return [R, G, B, 1.0];
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result;
}
