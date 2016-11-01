"use strict";
var FlumpMovieData_1 = require("./flump/FlumpMovieData");
var FlumpTextureGroup_1 = require("./flump/FlumpTextureGroup");
var FlumpMovie_1 = require("./flump/FlumpMovie");
var Promise_1 = require("./core/util/Promise");
var fetch = require("node-fetch");
var QueueItem_1 = require("./core/util/QueueItem");
var validUrl = require('valid-url');
var fs = require('fs-extra');
var FlumpLibrary = (function () {
    function FlumpLibrary(basePath) {
        this.movieData = [];
        this.textureGroups = [];
        this.fps = 0;
        this.isOptimised = false;
        this._hasLoaded = false;
        this._isLoading = false;
        this._loadingPromise = null;
        if (basePath) {
            this.url = basePath;
        }
    }
    FlumpLibrary.load = function (url, flumpLibrary) {
        var baseDir = url;
        if (url.indexOf('.json') > -1) {
            baseDir = url.substr(0, url.lastIndexOf('/'));
        }
        else {
            if (baseDir.substr(-1) == '/') {
                baseDir = baseDir.substr(0, baseDir.length - 1);
            }
            url += (url.substr(url.length - 1) != '/' ? '/' : '') + 'library.json';
        }
        if (flumpLibrary == void 0) {
            flumpLibrary = new FlumpLibrary(baseDir);
        }
        else {
            flumpLibrary.url = baseDir;
        }
        if (validUrl.isUri(url)) {
            var prom = fetch(url);
            return prom.then(function (res) { return res.json(); }).then(function (json) {
                return flumpLibrary.processData(json);
            });
        }
        else {
            return new Promise_1.Promise(function (resolve) {
                fs.readJson(url, function (err, json) {
                    flumpLibrary.processData(json).then(function (result) {
                        resolve(result);
                    });
                });
            });
        }
    };
    FlumpLibrary.prototype.hasLoaded = function () {
        return this._hasLoaded;
    };
    FlumpLibrary.prototype.isLoading = function () {
        return this._loadingPromise != null;
    };
    FlumpLibrary.prototype.load = function () {
        var _this = this;
        if (!this.url) {
            throw new Error('url is not set and there for can not be loaded');
        }
        if (!this._loadingPromise) {
            this._loadingPromise = FlumpLibrary.load(this.url, this).then(function (library) {
                _this._hasLoaded = true;
                return library;
            }).catch(function (err) {
                throw err;
            });
        }
        return this._loadingPromise;
    };
    FlumpLibrary.prototype.processData = function (json) {
        var _this = this;
        this.md5 = json.md5;
        this.frameRate = json.frameRate;
        this.referenceList = json.referenceList || null;
        this.isOptimised = json.optimised || false;
        var textureGroupLoaders = [];
        for (var i = 0; i < json.movies.length; i++) {
            var flumpMovieData = new FlumpMovieData_1.FlumpMovieData(this, json.movies[i]);
            this.movieData.push(flumpMovieData);
        }
        var textureGroups = json.textureGroups;
        for (var i = 0; i < textureGroups.length; i++) {
            var textureGroup = textureGroups[i];
            var promise = FlumpTextureGroup_1.FlumpTextureGroup.load(this, textureGroup);
            textureGroupLoaders.push(promise);
        }
        return Promise_1.Promise.all(textureGroupLoaders)
            .then(function (textureGroups) {
            for (var i = 0; i < textureGroups.length; i++) {
                var textureGroup = textureGroups[i];
                _this.textureGroups.push(textureGroup);
            }
            _this._hasLoaded = true;
            return _this;
        });
    };
    FlumpLibrary.prototype.getFlumpMovieData = function (name) {
        for (var i = 0; i < this.movieData.length; i++) {
            var movieData = this.movieData[i];
            if (movieData.id == name) {
                return movieData;
            }
        }
        throw new Error('movie not found');
    };
    FlumpLibrary.prototype.createSymbol = function (name, paused) {
        if (paused === void 0) { paused = false; }
        for (var i = 0; i < this.textureGroups.length; i++) {
            var flumpTextures = this.textureGroups[i].flumpTextures;
            if (name in flumpTextures) {
                return flumpTextures[name];
            }
        }
        for (var i = 0; i < this.movieData.length; i++) {
            var movieData = this.movieData[i];
            if (movieData.id == name) {
                var movie = new FlumpMovie_1.FlumpMovie(this, name);
                movie.getQueue().add(new QueueItem_1.QueueItem(null, 0, movie.frames, -1, 0));
                movie.paused = paused;
                return movie;
            }
        }
        console.warn('no _symbol found: (' + name + ')');
        throw new Error("no _symbol found");
    };
    FlumpLibrary.prototype.createMovie = function (id) {
        if (this.referenceList) {
            var name = this.referenceList.indexOf(id);
        }
        else {
            var name = id;
        }
        for (var i = 0; i < this.movieData.length; i++) {
            var movieData = this.movieData[i];
            if (movieData.id == name) {
                var movie = new FlumpMovie_1.FlumpMovie(this, name);
                movie.paused = true;
                return movie;
            }
        }
        console.warn('no _symbol found: (' + name + ') ', this);
        throw new Error("no _symbol found: " + this);
    };
    FlumpLibrary.prototype.getNameFromReferenceList = function (value) {
        if (this.referenceList && typeof value == 'number') {
            return this.referenceList[value];
        }
        return value;
    };
    FlumpLibrary.EVENT_LOAD = 'load';
    return FlumpLibrary;
}());
exports.FlumpLibrary = FlumpLibrary;
var Animator = (function () {
    function Animator(path) {
        this.library = new FlumpLibrary(path);
        this.library.load();
    }
    Animator.prototype.generate = function (movieClipName, ctx) {
        return this.library.load().then(function (library) {
            var movie = library.createMovie(movieClipName);
            movie.play();
            var fps = movie.fps;
            var duration = movie.frames / fps * 1000;
            var fpms = 1000 / fps;
            var currentTime = 0;
            var fn = function () {
                // console.log(duration, currentTime);
                if (duration > currentTime) {
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    movie.onTick(fpms);
                    movie.draw(ctx);
                    currentTime += fpms;
                    return true;
                }
                else {
                    return false;
                }
            };
            return fn;
        });
    };
    return Animator;
}());
exports.Animator = Animator;
