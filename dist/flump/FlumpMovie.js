"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var FlumpMovieLayer_1 = require("./FlumpMovieLayer");
var DisplayObject_1 = require("../core/DisplayObject");
var AnimationQueue_1 = require("../core/util/AnimationQueue");
var QueueItem_1 = require("../core/util/QueueItem");
/**
 * @author Mient-jan Stelling
 */
var FlumpMovie = (function (_super) {
    __extends(FlumpMovie, _super);
    // ToDo: add features like playOnce, playTo, goTo, loop, stop, isPlaying, label events, ...
    function FlumpMovie(flumpLibrary, name) {
        var _this = _super.call(this) || this;
        _this.type = 2048 /* FLUMPSYMBOL */;
        _this._labels = {};
        _this._labelQueue = [];
        _this._label = null;
        _this._queue = null;
        _this.hasFrameCallbacks = false;
        _this.paused = true;
        //public time:number = 0.0;
        //public duration = 0.0;
        _this.frame = 0;
        _this.frames = 0;
        _this.speed = 1;
        _this.fps = 1;
        _this.name = name;
        _this.flumpLibrary = flumpLibrary;
        _this.flumpMovieData = flumpLibrary.getFlumpMovieData(name);
        var layers = _this.flumpMovieData.flumpLayerDatas;
        var length = layers.length;
        var movieLayers = new Array(length);
        for (var i = 0; i < length; i++) {
            var layerData = layers[i];
            movieLayers[i] = new FlumpMovieLayer_1.FlumpMovieLayer(_this, layerData);
        }
        _this.flumpMovieLayers = movieLayers;
        _this.frames = _this.flumpMovieData.frames;
        _this._frameCallback = new Array(_this.frames);
        for (var i = 0; i < _this.frames; i++) {
            _this._frameCallback[i] = null;
        }
        _this.fps = flumpLibrary.frameRate;
        _this.getQueue();
        return _this;
    }
    FlumpMovie.prototype.getQueue = function () {
        if (!this._queue) {
            this._queue = new AnimationQueue_1.AnimationQueue(this.fps, 1000);
        }
        return this._queue;
    };
    FlumpMovie.prototype.play = function (times, label, complete) {
        if (times === void 0) { times = 1; }
        if (label === void 0) { label = null; }
        this.visible = true;
        if (label instanceof Array) {
            if (label.length == 1) {
                var queue = new QueueItem_1.QueueItem(null, label[0], this.frames, times, 0);
            }
            else {
                var queue = new QueueItem_1.QueueItem(null, label[0], label[1], times, 0);
            }
        }
        else if (label == null || label == '*') {
            var queue = new QueueItem_1.QueueItem(null, 0, this.frames, times, 0);
        }
        else {
            var queueLabel = this._labels[label];
            if (!queueLabel) {
                throw new Error('unknown label:' + queueLabel + ' | ' + this.name);
            }
            var queue = new QueueItem_1.QueueItem(queueLabel.label, queueLabel.index, queueLabel.duration, times, 0);
        }
        if (complete) {
            queue.then(complete);
        }
        this._queue.add(queue);
        if (complete) {
            queue.then(complete);
        }
        this.paused = false;
        return this;
    };
    FlumpMovie.prototype.resume = function () {
        this.paused = false;
        return this;
    };
    FlumpMovie.prototype.pause = function () {
        this.paused = true;
        return this;
    };
    FlumpMovie.prototype.end = function (all) {
        if (all === void 0) { all = false; }
        this._queue.end(all);
        return this;
    };
    FlumpMovie.prototype.stop = function () {
        this.paused = true;
        this._queue.kill();
        return this;
    };
    FlumpMovie.prototype.next = function () {
        return this._queue.next();
    };
    FlumpMovie.prototype.kill = function () {
        this._queue.kill();
        return this;
    };
    FlumpMovie.prototype.setFrameCallback = function (frameNumber, callback, triggerOnce) {
        var _this = this;
        if (triggerOnce === void 0) { triggerOnce = false; }
        this.hasFrameCallbacks = true;
        if (triggerOnce) {
            this._frameCallback[frameNumber] = function (delta) {
                callback.call(_this, delta);
                _this.setFrameCallback(frameNumber, null);
            };
        }
        else {
            this._frameCallback[frameNumber] = callback;
        }
        return this;
    };
    FlumpMovie.prototype.gotoAndStop = function (frameOrLabel) {
        var frame;
        if (typeof frameOrLabel === 'string') {
            frame = this._labels[frameOrLabel].index;
        }
        else {
            frame = frameOrLabel;
        }
        var queue = new QueueItem_1.QueueItem(null, frame, 1, 1, 0);
        this._queue.add(queue);
        return this;
    };
    FlumpMovie.prototype.onTick = function (delta, accumulated) {
        _super.prototype.onTick.call(this, delta, accumulated);
        delta *= this.speed;
        if (this.paused == false) {
            this._queue.onTick(delta);
            var frame = this.frame;
            var newFrame = this._queue.getFrame();
            for (var i = 0; i < this.flumpMovieLayers.length; i++) {
                var layer = this.flumpMovieLayers[i];
                layer.onTick(delta, accumulated);
                layer.setFrame(newFrame);
            }
            this.frame = newFrame;
        }
    };
    /**
     *
     * @param name
     * @returns {any}
     */
    FlumpMovie.prototype.getSymbol = function (name) {
        var layers = this.flumpMovieLayers;
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var symbol = layer.getSymbol(name);
            if (symbol != null) {
                return symbol;
            }
        }
        return null;
    };
    FlumpMovie.prototype.replaceSymbol = function (name, symbol) {
        var layers = this.flumpMovieLayers;
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            if (layer.replaceSymbol(name, symbol)) {
                return true;
            }
        }
        return false;
    };
    FlumpMovie.prototype.handleFrameCallback = function (fromFrame, toFrame, delta) {
        if (toFrame > fromFrame) {
            for (var index = fromFrame; index < toFrame; index++) {
                if (this._frameCallback[index]) {
                    this._frameCallback[index].call(this, delta);
                }
            }
        }
        else if (toFrame < fromFrame) {
            for (var index = fromFrame; index < this.frames; index++) {
                if (this._frameCallback[index]) {
                    this._frameCallback[index].call(this, delta);
                }
            }
            for (var index = 0; index < toFrame; index++) {
                if (this._frameCallback[index]) {
                    this._frameCallback[index].call(this, delta);
                }
            }
        }
        return this;
    };
    /*
        public setFrame(value:number):FlumpMovie
        {
            //console.log('setFrame', value, this.name);
    
            var layers = this.flumpMovieLayers;
            var length = layers.length;
    
            //( this.frames / flumpLibrary.frameRate ) * 1000;
    
            for(var i = 0; i < length; i++)
            {
                var layer = layers[i];
                if (layer.enabled)
                {
                    layer.reset();
                    layer.onTick( (value / this.frames) * this.duration );
                    layer.setFrame(value);
                }
            }
    
            return this;
        }*/
    FlumpMovie.prototype.draw = function (ctx, ignoreCache) {
        var layers = this.flumpMovieLayers;
        var length = layers.length;
        var ga = ctx.globalAlpha;
        for (var i = 0; i < length; i++) {
            var layer = layers[i];
            if (layer.visible && layer.enabled) {
                ctx.save();
                //layer.updateContext(ctx)
                ctx.globalAlpha = ga * layer.alpha;
                ctx.transform(layer._storedMtx.a, layer._storedMtx.b, layer._storedMtx.c, layer._storedMtx.d, layer._storedMtx.tx, // + (this.x),
                layer._storedMtx.ty // + (this.y)
                );
                layer.draw(ctx);
                ctx.restore();
            }
        }
        return true;
    };
    FlumpMovie.prototype.reset = function () {
        for (var i = 0; i < this.flumpMovieLayers.length; i++) {
            var layer = this.flumpMovieLayers[i];
            layer.reset();
        }
    };
    return FlumpMovie;
}(DisplayObject_1.DisplayObject));
exports.FlumpMovie = FlumpMovie;
