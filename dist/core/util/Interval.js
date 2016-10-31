/*
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 *
 * requestAnimationFrame polyfill
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Erik Möller
 * Copyright (c) 2015 Paul Irish
 * Copyright (c) 2015 Tino Zijdel
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above * copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Signal2_1 = require("../event/Signal2");
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}
/*
 * Interval
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Mient-jan Stelling
 * Copyright (c) 2015 MediaMonks B.V
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var FramePerSecondCollection = (function (_super) {
    __extends(FramePerSecondCollection, _super);
    function FramePerSecondCollection(fps, fixed) {
        _super.call(this);
        this.accum = 0;
        this.fixed = false;
        this.fps = fps;
        this.fixed = fixed;
        this.mspf = 1000 / fps;
    }
    return FramePerSecondCollection;
}(Signal2_1.Signal2));
exports.FramePerSecondCollection = FramePerSecondCollection;
var rafInt = 0;
var time = 0;
var list = [];
var listLength = 0;
function requestAnimationFrame(timeUpdate) {
    rafInt = window.requestAnimationFrame(requestAnimationFrame);
    var prevTime = time;
    time = timeUpdate;
    var delta = timeUpdate - prevTime;
    var fc;
    var mspf;
    for (var i = 0; i < listLength; i++) {
        fc = list[i];
        mspf = fc.mspf;
        fc.accum += delta;
        if (fc.fixed) {
            while (fc.accum >= fc.mspf) {
                fc.accum -= fc.mspf;
                fc.emit(fc.mspf, fc.accum);
            }
        }
        else if (fc.accum >= fc.mspf) {
            fc.signal.emit(fc.mspf, fc.accum);
            fc.accum = 0;
        }
    }
}
var Interval = (function () {
    function Interval(fps, fixedTimeStep) {
        if (fps === void 0) { fps = 60; }
        if (fixedTimeStep === void 0) { fixedTimeStep = false; }
        this._connections = [];
        this._fps = fps;
        this._fixedTimeStep = fixedTimeStep;
    }
    Interval.attach = function (fps, fixed, callback) {
        if (fixed === void 0) { fixed = false; }
        // floor fps
        var framePerSecond = fps | 0;
        var fc = null;
        for (var i = 0; i < list.length; i++) {
            if (list[i].fps == framePerSecond && list[i].fixed == fixed) {
                fc = list[i];
            }
        }
        if (!fc) {
            fc = new FramePerSecondCollection(framePerSecond, fixed);
            list.push(fc);
            listLength = list.length;
        }
        return fc.connect(callback);
    };
    Interval.start = function () {
        if (!Interval.isRunning) {
            Interval.isRunning = true;
            requestAnimationFrame(0);
        }
    };
    Interval.stop = function () {
        Interval.isRunning = false;
        cancelAnimationFrame(rafInt);
    };
    Interval.prototype.attach = function (callback) {
        var connection = Interval.attach(this._fps, this._fixedTimeStep, callback);
        this._connections.push(connection);
        Interval.start();
        return connection;
    };
    Interval.prototype.destruct = function () {
        var connections = this._connections;
        while (connections.length) {
            connections.pop().dispose();
        }
    };
    Interval.isRunning = false;
    return Interval;
}());
exports.Interval = Interval;
