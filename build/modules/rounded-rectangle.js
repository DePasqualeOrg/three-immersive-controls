"use strict";
// https://newfivefour.com/javascript-canvas-rounded-rectangle.html
CanvasRenderingContext2D.prototype.roundedRectangle = function (x, y, width, height, rounded) {
    // const radiansInCircle = 2 * Math.PI;
    const halfRadians = (2 * Math.PI) / 2;
    const quarterRadians = (2 * Math.PI) / 4;
    // top left arc
    this.arc(rounded + x, rounded + y, rounded, -quarterRadians, halfRadians, true);
    // line from top left to bottom left
    this.lineTo(x, y + height - rounded);
    // bottom left arc
    this.arc(rounded + x, height - rounded + y, rounded, halfRadians, quarterRadians, true);
    // line from bottom left to bottom right
    this.lineTo(x + width - rounded, y + height);
    // bottom right arc
    this.arc(x + width - rounded, y + height - rounded, rounded, quarterRadians, 0, true);
    // line from bottom right to top right
    this.lineTo(x + width, y + rounded);
    // top right arc
    this.arc(x + width - rounded, y + rounded, rounded, 0, -quarterRadians, true);
    // line from top right to top left
    this.lineTo(x + rounded, y);
};
