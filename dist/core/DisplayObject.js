"use strict";
var DisplayObject = (function () {
    function DisplayObject() {
        this.visible = true;
        this.alpha = 1;
        this.scaleX = 1;
        this.scaleY = 1;
    }
    DisplayObject.prototype.onTick = function (delta, accumilated) { };
    return DisplayObject;
}());
exports.DisplayObject = DisplayObject;
