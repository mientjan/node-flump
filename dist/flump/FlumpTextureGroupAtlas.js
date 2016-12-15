"use strict";
var FlumpTexture_1 = require("./FlumpTexture");
var loadImage_1 = require("../core/util/loadImage");
var FlumpTextureGroupAtlas = (function () {
    function FlumpTextureGroupAtlas(renderTexture, json) {
        this.flumpTextures = {};
        this.renderTexture = renderTexture;
        var textures = json.textures;
        for (var i = 0; i < textures.length; i++) {
            var texture = textures[i];
            this.flumpTextures[texture.symbol] = new FlumpTexture_1.FlumpTexture(renderTexture, texture);
        }
    }
    FlumpTextureGroupAtlas.load = function (flumpLibrary, json) {
        var file = json.file;
        var url = flumpLibrary.url + '/' + file;
        return loadImage_1.loadImage(url).then(function (data) {
            return new FlumpTextureGroupAtlas(data, json);
        });
    };
    return FlumpTextureGroupAtlas;
}());
exports.FlumpTextureGroupAtlas = FlumpTextureGroupAtlas;
