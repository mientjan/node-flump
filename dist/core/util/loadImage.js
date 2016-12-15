"use strict";
var Promise_1 = require("./Promise");
var Canvas = require("canvas");
var fs = require("fs");
function loadImage(url) {
    return new Promise_1.Promise(function (resolve, reject) {
        var img = new Canvas.Image;
        fs.readFile(url, function (err, imageData) {
            if (err) {
                reject();
            }
            else {
                img.src = imageData;
                resolve(img);
            }
        });
    });
}
exports.loadImage = loadImage;
