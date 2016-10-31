"use strict";
var Tween_1 = require("../../tweents/Tween");
var MovieClip_1 = require("./MovieClip");
// MovieClipPlugin for TweenJS:
/**
 * This plugin works with <a href="http://tweenjs.com" target="_blank">TweenJS</a> to prevent the startPosition
 * property from tweening.
 * @private
 * @class MovieClipPlugin
 * @constructor
 **/
var MovieClipPlugin = (function () {
    function MovieClipPlugin() {
        throw ("MovieClipPlugin cannot be instantiated.");
    }
    /**
     * @method install
     * @private
     **/
    MovieClipPlugin.install = function () {
        Tween_1.Tween.installPlugin(MovieClipPlugin, ["startPosition"]);
    };
    /**
     * @method init
     * @param {Tween} tween
     * @param {String} prop
     * @param {String|Number|Boolean} value
     * @private
     **/
    MovieClipPlugin.init = function (tween, prop, value) {
        return value;
    };
    /**
     * @method step
     * @private
     **/
    MovieClipPlugin.step = function () {
        // unused.
    };
    /**
     * @method tween
     * @param {Tween} tween
     * @param {String} prop
     * @param {String | Number | Boolean} value
     * @param {Array} startValues
     * @param {Array} endValues
     * @param {Number} ratio
     * @param {Object} wait
     * @param {Object} end
     * @return {*}
     */
    MovieClipPlugin.tween = function (tween, prop, value, startValues, endValues, ratio, wait, end) {
        if (!(tween.target instanceof MovieClip_1.MovieClip)) {
            return value;
        }
        return (ratio == 1 ? endValues[prop] : startValues[prop]);
    };
    /**
     * @method priority
     * @private
     **/
    MovieClipPlugin.priority = 100; // very high priority, should run first
    return MovieClipPlugin;
}());
exports.MovieClipPlugin = MovieClipPlugin;
