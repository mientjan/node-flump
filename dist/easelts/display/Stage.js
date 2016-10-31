/*
 * Stage
 *
 * Copyright (c) 2010 gskinner.com, inc.
 * Copyright (c) 2014-2015 Mient-jan Stelling
 * Copyright (c) 2015 MediaMonks B.V
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
 * The above copyright notice and this permission notice shall be
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
var Container_1 = require("./Container");
var PointerData_1 = require("../geom/PointerData");
var PointerEvent_1 = require("../event/PointerEvent");
var Signal_1 = require("../../core/event/Signal");
var Interval_1 = require("../../core/util/Interval");
var StageOption_1 = require("../data/StageOption");
var Canvas2DElement_1 = require("../renderer/Canvas2DElement");
var Context2dRenderer_1 = require("../renderer/context2d/Context2dRenderer");
// display
// interfaces
// geom
// enum
// event / signal
/**
 * @module createts
 */
/**
 * A stage is the root level {{#crossLink "Container"}}{{/crossLink}} for a display list. Each time its {{#crossLink "Stage/tick"}}{{/crossLink}}
 * method is called, it will render its display list to its target canvas.
 *
 * <h4>Example</h4>
 * This example creates a stage, adds a child to it, then uses {{#crossLink "Ticker"}}{{/crossLink}} to update the child
 * and redraw the stage using {{#crossLink "Stage/update"}}{{/crossLink}}.
 *
 *      var stage = new Stage("canvasElementId");
 *      var image = new Bitmap("imagePath.png");
 *      stage.addChild(image);
 *      stage.start();
 *
 * @namespace easelts.display
 * @class Stage
 * @extends Container
 * @constructor
 * @param {HTMLCanvasElement | String | Object} canvas A canvas object that the Stage will render to, or the string id
 * of a canvas object in the current document.
 **/
var Stage = (function (_super) {
    __extends(Stage, _super);
    /**
     * @class Stage
     * @constructor
     * @param {HTMLCanvasElement|HTMLBlockElement} element A canvas or div element. If it's a div element, a canvas object will be created and appended to the div.
     * @param {boolean} [triggerResizeOnWindowResize=false] Indicates whether onResize should be called when the window is resized
     **/
    function Stage(element, option) {
        var _this = this;
        _super.call(this, '100%', '100%', 0, 0, 0, 0);
        this.tickstartSignal = new Signal_1.Signal();
        /**
         * Dispatched each update immediately after the tick event is propagated through the display list. Does not fire if
         * tickOnUpdate is false. Precedes the "drawstart" event.
         * @event tickend
         */
        this.tickendSignal = new Signal_1.Signal();
        /**
         * Dispatched each update immediately before the canvas is cleared and the display list is drawn to it.
         * You can call preventDefault on the event object to cancel the draw.
         * @deprecated
         * @event drawstart
         */
        this.drawstartSignal = new Signal_1.Signal();
        /**
         * is patched each update immediately after the display list is drawn to the canvas and the canvas context is restored.
         * @deprecated
         * @event drawend
         */
        this.drawendSignal = new Signal_1.Signal();
        // public properties:
        this.type = 4 /* STAGE */;
        this._isRunning = false;
        this._fps = -1;
        this._eventListeners = null;
        this._onResizeEventListener = null;
        /**
         *
         */
        this.holder = null;
        /**
         * The current mouse X position on the canvas. If the mouse leaves the canvas, this will indicate the most recent
         * position over the canvas, and mouseInBounds will be set to false.
         * @property mouseX
         * @type Number
         * @readonly
         **/
        this.mouseX = 0;
        /**
         * The current mouse Y position on the canvas. If the mouse leaves the canvas, this will indicate the most recent
         * position over the canvas, and mouseInBounds will be set to false.
         * @property mouseY
         * @type Number
         * @readonly
         **/
        this.mouseY = 0;
        /**
         * Specifies the area of the stage to affect when calling update. This can be use to selectively
         * re-render only active regions of the canvas. If null, the whole canvas area is affected.
         * @property drawRect
         * @type {Rectangle}
         */
        this.drawRect = null;
        /**
         * Indicates whether display objects should be rendered on whole pixels. You can set the
         * {{#crossLink "DisplayObject/snapToPixel"}}{{/crossLink}} property of
         * display objects to false to enable/disable this behaviour on a per instance basis.
         * @property snapToPixelEnabled
         * @type Boolean
         * @default false
         **/
        this.snapToPixelEnabled = false;
        /**
         * Indicates whether the mouse is currently within the bounds of the canvas.
         * @property mouseInBounds
         * @type Boolean
         * @default false
         **/
        this.mouseInBounds = false;
        /**
         * If true, tick callbacks will be called on all display objects on the stage prior to rendering to the canvas.
         * @property tickOnUpdate
         * @type Boolean
         * @default true
         **/
        this.tickOnUpdate = true;
        /**
         * If true, mouse move events will continue to be called when the mouse leaves the target canvas. See
         * {{#crossLink "Stage/mouseInBounds:property"}}{{/crossLink}}, and {{#crossLink "MouseEvent"}}{{/crossLink}}
         * x/y/rawX/rawY.
         * @property mouseMoveOutside
         * @type Boolean
         * @default false
         **/
        this.mouseMoveOutside = false;
        /**
         * Holds objects with data for each active pointer id. Each object has the following properties:
         * x, y, event, target, overTarget, overX, overY, inBounds, posEvtObj (native event that last updated position)
         * @property _pointerData
         * @type {Object}
         * @private
         */
        this._pointerData = {};
        /**
         * Number of active pointers.
         * @property _pointerCount
         * @type {number}
         * @private
         */
        this._pointerCount = 0;
        /**
         * The ID of the primary pointer.
         * @property _primaryPointerID
         * @type {Object}
         * @private
         */
        this._primaryPointerID = null;
        /**
         * @property _mouseOverIntervalID
         * @protected
         * @type Number
         **/
        this._mouseOverIntervalID = null;
        /**
         * @property _nextStage
         * @protected
         * @type Stage
         **/
        this._nextStage = null;
        /**
         * @property _prevStage
         * @protected
         * @type Stage
         **/
        this._prevStage = null;
        /**
         * Each time the update method is called, the stage will call {{#crossLink "Stage/tick"}}{{/crossLink}}
         * unless {{#crossLink "Stage/tickOnUpdate:property"}}{{/crossLink}} is set to false,
         * and then render the display list to the canvas.
         *
         * @method update
         * @param {TimeEvent} [timeEvent=0]
         **/
        this.update = function (delta, accumulated) {
            _this.onTick(delta, accumulated);
            console.log(delta, accumulated);
            if (delta > accumulated) {
                _this.render();
            }
        };
        this._option = new StageOption_1.StageOption(option);
        var canvas, width, height;
        if (element.tagName == 'CANVAS') {
            canvas = element;
            this.holder = element.parentElement;
            if (this._option.autoResize) {
                width = this.holder.offsetWidth;
                height = this.holder.offsetHeight;
            }
            else {
                width = canvas.width;
                height = canvas.height;
            }
        }
        else {
            canvas = document.createElement('canvas');
            this.holder = element;
            width = this.holder.offsetWidth;
            height = this.holder.offsetHeight;
        }
        this.setBuffer(new Canvas2DElement_1.Canvas2DElement(width, height, {
            domElement: canvas,
            transparent: this._option.transparent,
            backgroundColor: '' + this._option.autoClearColor
        }), this._option.autoResize);
        if (element.tagName != 'CANVAS') {
            this.holder.appendChild(canvas);
        }
        this.enableDOMEvents(true);
        this.setFps(this._fps);
        this.stage = this;
        if (this._option.autoResize) {
            this.enableAutoResize();
        }
        this._renderer = new Context2dRenderer_1.Context2dRenderer();
        this._renderer.setElement(this._buffer);
        this.onResize(this._buffer.width, this._buffer.height);
    }
    Object.defineProperty(Stage.prototype, "nextStage", {
        // getter / setters:
        /**
         * Specifies a target stage that will have mouse / touch interactions relayed to it after this stage handles them.
         * This can be useful in cases where you have multiple layered canvases and want user interactions
         * events to pass through. For example, this would relay mouse events from topStage to bottomStage:
         *
         *      topStage.nextStage = bottomStage;
         *
         * To disable relaying, set nextStage to null.
         *
         * MouseOver, MouseOut, RollOver, and RollOut interactions are also passed through using the mouse over settings
         * of the top-most stage, but are only processed if the target stage has mouse over interactions enabled.
         * Considerations when using roll over in relay targets:<OL>
         * <LI> The top-most (first) stage must have mouse over interactions enabled (via enableMouseOver)</LI>
         * <LI> All stages that wish to participate in mouse over interaction must enable them via enableMouseOver</LI>
         * <LI> All relay targets will share the frequency value of the top-most stage</LI>
         * </OL>
         * To illustrate, in this example the targetStage would process mouse over interactions at 10hz (despite passing
         * 30 as it's desired frequency):
         *    topStage.nextStage = targetStage;
         *    topStage.enableMouseOver(10);
         *    targetStage.enableMouseOver(30);
         *
         * If the target stage's canvas is completely covered by this stage's canvas, you may also want to disable its
         * DOM events using:
         *
         *    targetStage.enableDOMEvents(false);
         *
         * @property nextStage
         * @type {Stage}
         **/
        get: function () {
            return this._nextStage;
        },
        set: function (value) {
            if (this._nextStage) {
                this._nextStage._prevStage = null;
            }
            if (value) {
                value._prevStage = this;
            }
            this._nextStage = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @method setQuality
     * @param {QualityType} value
     * @public
     */
    Stage.prototype.setQuality = function (value) {
        this._buffer.setQuality(value);
        return this;
    };
    Stage.prototype.getRenderer = function () {
        return this._renderer;
    };
    Stage.prototype.render = function () {
        var renderer = this._renderer;
        renderer.render(this);
    };
    /**
     * Clears the target canvas. Useful if {{#crossLink "Stage/autoClear:property"}}{{/crossLink}} is set to `false`.
     * @method clear
     **/
    Stage.prototype.clear = function () {
        this._buffer.clear();
    };
    /**
     * Returns a data url that contains a Base64-encoded image of the contents of the stage. The returned data url can
     * be specified as the src value of an image element.
     * @method toDataURL
     * @param {String} backgroundColor The background color to be used for the generated image. The value can be any value HTML color
     * value, including HEX colors, rgb and rgba. The default value is a transparent background.
     * @param {String} mimeType The MIME type of the image format to be create. The default is "image/png". If an unknown MIME type
     * is passed in, or if the browser does not support the specified MIME type, the default value will be used.
     * @return {String} a Base64 encoded image.
     **/
    Stage.prototype.toDataURL = function (backgroundColor, mimeType) {
        return this._buffer.toDataURL(backgroundColor, mimeType);
    };
    /**
     * <h4>Example</h4>
     *
     *      var stage = new Stage("canvasId");
     *      stage.enableMouseOver(10); // 10 updates per second
     *
     * @method enableMouseOver
     * @param {Number} [frequency=20] Optional param specifying the maximum number of times per second to broadcast
     * mouse over/out events. Set to 0 to disable mouse over events completely. Maximum is 50. A lower frequency is less
     * responsive, but uses less CPU.
     * @todo remove setInterval
     **/
    Stage.prototype.enableMouseOver = function (frequency) {
        var _this = this;
        if (frequency === void 0) { frequency = null; }
        if (this._mouseOverIntervalID) {
            clearInterval(this._mouseOverIntervalID);
            this._mouseOverIntervalID = null;
            if (frequency == 0) {
                this._testMouseOver(true);
            }
        }
        if (frequency == null) {
            frequency = 20;
        }
        else if (frequency <= 0) {
            return void 0;
        }
        this.setMouseInteraction(true);
        this._mouseOverIntervalID = setInterval(function () {
            _this._testMouseOver();
        }, 1000 / Math.min(50, frequency));
    };
    /**
     * Enables or disables the event listeners that stage adds to DOM elements (window, document and canvas). It is good
     * practice to disable events when disposing of a Stage instance, otherwise the stage will continue to receive
     * events from the page.
     *
     * When changing the canvas property you must disable the events on the old canvas, and enable events on the
     * new canvas or mouse events will not work as expected. For example:
     *
     *      myStage.enableDOMEvents(false);
     *      myStage.canvas = anotherCanvas;
     *      myStage.enableDOMEvents(true);
     *
     * @method enableDOMEvents
     * @param {Boolean} [enable=true] Indicates whether to enable or disable the events. Default is true.
     **/
    Stage.prototype.enableDOMEvents = function (enable) {
        var _this = this;
        if (enable === void 0) { enable = true; }
        var name, o, eventListeners = this._eventListeners;
        var canvas = this._buffer.getDomElement();
        if (!enable && eventListeners) {
            for (name in eventListeners) {
                o = eventListeners[name];
                o.window.removeEventListener(name, o.fn, false);
            }
            this._eventListeners = null;
        }
        else if (enable && !eventListeners && canvas) {
            var windowsObject = window['addEventListener'] ? window : document;
            eventListeners = this._eventListeners = {};
            //			Stage.EVENT_MOUSE
            eventListeners["mouseup"] = {
                window: windowsObject,
                fn: function (e) { return _this._handleMouseUp(e); }
            };
            eventListeners["mousemove"] = {
                window: windowsObject,
                fn: function (e) { return _this._handleMouseMove(e); }
            };
            eventListeners["mousedown"] = {
                window: canvas,
                fn: function (e) { return _this._handleMouseDown(e); }
            };
            //			eventListeners["dblclick"] = {
            //				window: this.canvas,
            //				fn: (e) =>
            //				{
            //					this._handleDoubleClick(e)
            //				}
            //			};
            for (name in eventListeners) {
                o = eventListeners[name];
                o.window.addEventListener(name, o.fn, false);
            }
        }
    };
    Stage.prototype.getContext = function () {
        return this._buffer.getContext();
    };
    /**
     * Returns a clone of this Stage.
     * @method clone
     * @return {Stage} A clone of the current Container instance.
     **/
    Stage.prototype.clone = function () {
        var o = new Stage(null, this._option.autoResize);
        this.cloneProps(o);
        return o;
    };
    /**
     * Returns a string representation of this object.
     *
     * @method toString
     * @return {String} a string representation of the instance.
     **/
    Stage.prototype.toString = function () {
        return "[Stage (name=" + this.name + ")]";
    };
    /**
     * @method _getElementRect
     * @protected
     * @param {HTMLElement} element
     **/
    Stage.prototype._getElementRect = function (element) {
        var bounds;
        //		try
        //		{
        bounds = element.getBoundingClientRect();
        //		} // this can fail on disconnected DOM elements in IE9
        //		catch(err)
        //		{
        //			bounds = {top: e.offsetTop, left: e.offsetLeft, width: e.offsetWidth, height: e.offsetHeight};
        //		}
        var offX = (window.pageXOffset || document['scrollLeft'] || 0) - (document['clientLeft'] || document.body.clientLeft || 0);
        var offY = (window.pageYOffset || document['scrollTop'] || 0) - (document['clientTop'] || document.body.clientTop || 0);
        var styles = window.getComputedStyle ? getComputedStyle(element, null) : element['currentStyle']; // IE <9 compatibility.
        var padL = parseInt(styles.paddingLeft) + parseInt(styles.borderLeftWidth);
        var padT = parseInt(styles.paddingTop) + parseInt(styles.borderTopWidth);
        var padR = parseInt(styles.paddingRight) + parseInt(styles.borderRightWidth);
        var padB = parseInt(styles.paddingBottom) + parseInt(styles.borderBottomWidth);
        // note: in some browsers bounds properties are read only.
        return {
            left: bounds.left + offX + padL,
            right: bounds.right + offX - padR,
            top: bounds.top + offY + padT,
            bottom: bounds.bottom + offY - padB
        };
    };
    /**
     * @method _getPointerData
     * @protected
     * @param {Number} id
     **/
    Stage.prototype._getPointerData = function (id) {
        var data = this._pointerData[id];
        if (!data) {
            data = this._pointerData[id] = new PointerData_1.PointerData(0, 0);
            // if it's the first new touch, then make it the primary pointer id:
            if (this._primaryPointerID == null) {
                this._primaryPointerID = id;
            }
            // if it's the mouse (id == -1) or the first new touch, then make it the primary pointer id:
            if (this._primaryPointerID == null || this._primaryPointerID == -1) {
                this._primaryPointerID = id;
            }
        }
        return data;
    };
    /**
     * @method _handleMouseMove
     * @protected
     * @param {MouseEvent} e
     **/
    Stage.prototype._handleMouseMove = function (e) {
        //		if(!e){
        //			var b = <MouseEvent> window['event'];
        //		 }
        if (e === void 0) { e = window['event']; }
        this._handlePointerMove(-1, e, e.pageX, e.pageY);
    };
    /**
     * @method _handlePointerMove
     * @protected
     * @param {Number} id
     * @param {Event} e
     * @param {Number} pageX
     * @param {Number} pageY
     * @param {Stage} owner Indicates that the event has already been captured & handled by the indicated stage.
     **/
    Stage.prototype._handlePointerMove = function (id, e, pageX, pageY, owner) {
        if (this._prevStage && owner === undefined) {
            return;
        }
        //
        //// redundant listener.
        //if(!this.ctx)
        //{
        //	return;
        //}
        var nextStage = this._nextStage;
        var pointerData = this._getPointerData(id);
        var inBounds = pointerData.inBounds;
        this._updatePointerPosition(id, e, pageX, pageY);
        if (inBounds || pointerData.inBounds || this.mouseMoveOutside) {
            if (id == -1 && pointerData.inBounds == !inBounds) {
                this._dispatchMouseEvent(this, (inBounds ? "mouseleave" : "mouseenter"), false, id, pointerData, e);
            }
            this._dispatchMouseEvent(this, "stagemousemove", false, id, pointerData, e);
            this._dispatchMouseEvent(pointerData.target, "pressmove", true, id, pointerData, e);
        }
        nextStage && nextStage._handlePointerMove(id, e, pageX, pageY, null);
    };
    /**
     * @method _updatePointerPosition
     * @protected
     * @param {Number} id
     * @param {Event} e
     * @param {Number} pageX
     * @param {Number} pageY
     **/
    Stage.prototype._updatePointerPosition = function (id, e, pageX, pageY) {
        var buffer = this._buffer;
        var rect = this._getElementRect(buffer.getDomElement());
        pageX -= rect.left;
        pageY -= rect.top;
        var w = buffer.width;
        var h = buffer.height;
        pageX /= (rect.right - rect.left) / w;
        pageY /= (rect.bottom - rect.top) / h;
        var pointerData = this._getPointerData(id);
        if (pointerData.inBounds = (pageX >= 0 && pageY >= 0 && pageX <= w - 1 && pageY <= h - 1)) {
            pointerData.x = pageX;
            pointerData.y = pageY;
        }
        else if (this.mouseMoveOutside) {
            pointerData.x = pageX < 0 ? 0 : (pageX > w - 1 ? w - 1 : pageX);
            pointerData.y = pageY < 0 ? 0 : (pageY > h - 1 ? h - 1 : pageY);
        }
        pointerData.posEvtObj = e;
        pointerData.rawX = pageX;
        pointerData.rawY = pageY;
        if (id == this._primaryPointerID) {
            this.mouseX = pointerData.x;
            this.mouseY = pointerData.y;
            this.mouseInBounds = pointerData.inBounds;
        }
    };
    /**
     * @method _handleMouseUp
     * @protected
     * @param {MouseEvent} e
     **/
    Stage.prototype._handleMouseUp = function (e) {
        this._handlePointerUp(-1, e, false);
    };
    /**
     * @method _handlePointerUp
     * @protected
     * @param {Number} id
     * @param {Event} e
     * @param {Boolean} clear
     * @param {Stage} owner Indicates that the event has already been captured & handled by the indicated stage.
     **/
    Stage.prototype._handlePointerUp = function (id, e, clear, owner) {
        var nextStage = this._nextStage, o = this._getPointerData(id);
        if (this._prevStage && owner === undefined) {
            return;
        } // redundant listener.
        this._dispatchMouseEvent(this, "stagemouseup", false, id, o, e);
        var target = null, oTarget = o.target;
        if (!owner && (oTarget || nextStage)) {
            target = this._getObjectsUnderPoint(o.x, o.y, null, true);
        }
        if (target == oTarget) {
            this._dispatchMouseEvent(oTarget, "click", true, id, o, e);
        }
        this._dispatchMouseEvent(oTarget, "pressup", true, id, o, e);
        if (clear) {
            if (id == this._primaryPointerID) {
                this._primaryPointerID = null;
            }
            delete (this._pointerData[id]);
        }
        else {
            o.target = null;
        }
        nextStage && nextStage._handlePointerUp(id, e, clear, owner || target && this);
    };
    /**
     * @method _handleMouseDown
     * @protected
     * @param {MouseEvent} e
     **/
    Stage.prototype._handleMouseDown = function (e) {
        this._handlePointerDown(-1, e, e.pageX, e.pageY);
    };
    /**
     * @method _handlePointerDown
     * @protected
     * @param {Number} id
     * @param {Event} e
     * @param {Number} pageX
     * @param {Number} pageY
     * @param {Stage} owner Indicates that the event has already been captured & handled by the indicated stage.
     **/
    Stage.prototype._handlePointerDown = function (id, e, pageX, pageY, owner) {
        if (pageY != null) {
            this._updatePointerPosition(id, e, pageX, pageY);
        }
        var target = null;
        var nextStage = this._nextStage;
        var pointerData = this._getPointerData(id);
        if (pointerData.inBounds) {
            this._dispatchMouseEvent(this, "stagemousedown", false, id, pointerData, e);
        }
        if (!owner) {
            target = pointerData.target = this._getObjectsUnderPoint(pointerData.x, pointerData.y, null, true);
            this._dispatchMouseEvent(pointerData.target, "mousedown", true, id, pointerData, e);
        }
        nextStage && nextStage._handlePointerDown(id, e, pageX, pageY, owner || target && this);
    };
    /**
     * @method _testMouseOver
     * @param {Boolean} clear If true, clears the mouseover / rollover (ie. no target)
     * @param {Stage} owner Indicates that the event has already been captured & handled by the indicated stage.
     * @param {Stage} eventTarget The stage that the cursor is actively over.
     * @protected
     **/
    Stage.prototype._testMouseOver = function (clear, owner, eventTarget) {
        if (this._prevStage && owner === undefined) {
            return;
        } // redundant listener.
        var nextStage = this._nextStage;
        if (!this._mouseOverIntervalID) {
            // not enabled for mouseover, but should still relay the event.
            nextStage && nextStage._testMouseOver(clear, owner, eventTarget);
            return;
        }
        // only update if the mouse position has changed. This provides a lot of optimization, but has some trade-offs.
        if (this._primaryPointerID != -1 || (!clear && this.mouseX == this._mouseOverX && this.mouseY == this._mouseOverY && this.mouseInBounds)) {
            return;
        }
        var o = this._getPointerData(-1), e = o.posEvtObj;
        var isEventTarget = eventTarget || e && (e.target == this._buffer.getDomElement());
        var target = null, common = -1, cursor = "", t, i, l;
        if (!owner && (clear || this.mouseInBounds && isEventTarget)) {
            target = this._getObjectsUnderPoint(this.mouseX, this.mouseY, null, true);
            this._mouseOverX = this.mouseX;
            this._mouseOverY = this.mouseY;
        }
        var oldList = this._mouseOverTarget || [];
        var oldTarget = oldList[oldList.length - 1];
        var list = this._mouseOverTarget = [];
        // generate ancestor list and check for cursor:
        t = target;
        while (t) {
            list.unshift(t);
            if (t.cursor != null) {
                cursor = t.cursor;
            }
            t = t.parent;
        }
        this._buffer.getDomElement().style.cursor = cursor;
        if (!owner && eventTarget) {
            eventTarget.getContext().canvas.style.cursor = cursor;
        }
        // find common ancestor:
        for (i = 0, l = list.length; i < l; i++) {
            if (list[i] != oldList[i]) {
                break;
            }
            common = i;
        }
        if (oldTarget != target) {
            this._dispatchMouseEvent(oldTarget, "mouseout", true, -1, o, e);
        }
        for (i = oldList.length - 1; i > common; i--) {
            this._dispatchMouseEvent(oldList[i], "rollout", false, -1, o, e);
        }
        for (i = list.length - 1; i > common; i--) {
            this._dispatchMouseEvent(list[i], "rollover", false, -1, o, e);
        }
        if (oldTarget != target) {
            this._dispatchMouseEvent(target, "mouseover", true, -1, o, e);
        }
        nextStage && nextStage._testMouseOver(clear, owner || target && this, eventTarget || isEventTarget && this);
    };
    /**
     * @method _handleDoubleClick
     * @protected
     * @param {MouseEvent} e
     * @param {Stage} owner Indicates that the event has already been captured & handled by the indicated stage.
     **/
    Stage.prototype._handleDoubleClick = function (e, owner) {
        var target = null, nextStage = this._nextStage, o = this._getPointerData(-1);
        if (!owner) {
            target = this._getObjectsUnderPoint(o.x, o.y, null, true);
            this._dispatchMouseEvent(target, "dblclick", true, -1, o, e);
        }
        nextStage && nextStage._handleDoubleClick(e, owner || target && this);
    };
    /**
     * @method _handleWindowResize
     * @protected
     **/
    Stage.prototype._handleWindowResize = function (e) {
        this.onResize(this.holder.offsetWidth, this.holder.offsetHeight);
    };
    /**
     *
     * @todo what is the o param
     *
     * @method _dispatchMouseEvent
     * @protected
     * @param {DisplayObject} target
     * @param {String} type
     * @param {Boolean} bubbles
     * @param {Number} pointerId
     * @param {Object} o
     * @param {MouseEvent} [nativeEvent]
     **/
    Stage.prototype._dispatchMouseEvent = function (target, type, bubbles, pointerId, o, nativeEvent) {
        // TODO: might be worth either reusing MouseEvent instances, or adding a willTrigger method to avoid GC.
        if (!target || (!bubbles && !target.hasEventListener(type))) {
            return;
        }
        /*
         // TODO: account for stage transformations:
         this._mtx = this.getConcatenatedMatrix(this._mtx).invert();
         var pt = this._mtx.transformPoint(o.x, o.y);
         var evt = new createts.MouseEvent(type, bubbles, false, pt.x, pt.y, nativeEvent, pointerId, pointerId==this._primaryPointerID, o.rawX, o.rawY);
         */
        var evt = new PointerEvent_1.PointerEvent(type, bubbles, false, o.x, o.y, nativeEvent, pointerId, pointerId == this._primaryPointerID, o.rawX, o.rawY);
        target.dispatchEvent(evt);
    };
    /**
     * So you can specify the fps of the animation. This operation sets
     * the fps for all createjs operations and tweenlite.
     *
     * @method setFps
     * @param value
     */
    Stage.prototype.setFps = function (value) {
        this._fps = value;
        return this;
    };
    /**
     * Return the current fps of this stage.
     *
     * @returns {number}
     */
    Stage.prototype.getFps = function () {
        return this._fps;
    };
    Stage.prototype.enableAutoResize = function () {
        var _this = this;
        this._onResizeEventListener = function (e) { return _this._handleWindowResize(e); };
        window.addEventListener('resize', this._onResizeEventListener);
    };
    Stage.prototype.disableAutoResize = function () {
        window.removeEventListener('resize', this._onResizeEventListener);
    };
    Stage.prototype.setMouseInteraction = function (value) {
        this.enableDOMEvents(value);
        _super.prototype.setMouseInteraction.call(this, value);
    };
    /**
     * Start the update loop.
     *
     * @method start
     * @returns {boolean}
     */
    Stage.prototype.start = function () {
        this.stop();
        this._interval = new Interval_1.Interval(60, true);
        this._interval.attach(this.update);
        this._isRunning = true;
        return this;
    };
    /**
     * Will stop all animation and updates to the stage.
     *
     * @method stop
     * @returns {boolean}
     */
    Stage.prototype.stop = function () {
        // remove Signal connection
        if (this._interval) {
            this._interval.destruct();
            this._interval = null;
        }
        this._isRunning = false;
        return this;
    };
    /**
     * Check if stage is running
     *
     * @method isRunning
     * @returns {boolean}
     */
    Stage.prototype.isRunning = function () {
        return this._isRunning;
    };
    /**
     * Is triggered when the stage (canvas) is resized.
     * Will give this new information to all children.
     *
     * @method onResize
     * @param {Size} size
     */
    Stage.prototype.onResize = function (width, height) {
        var pixelRatio = this._option.pixelRatio;
        // anti-half pixel fix
        width = width + 1 >> 1 << 1;
        height = height + 1 >> 1 << 1;
        if (this.width != width || this.height != height) {
            this._buffer.width = width * pixelRatio;
            this._buffer.height = height * pixelRatio;
            this._buffer.getDomElement().style.width = '' + width + 'px';
            this._buffer.getDomElement().style.height = '' + height + 'px';
            _super.prototype.onResize.call(this, width, height);
            if (!this._isRunning) {
                this.render();
            }
        }
    };
    Stage.prototype.destruct = function () {
        this.stop();
        this.enableDOMEvents(false);
        _super.prototype.destruct.call(this);
    };
    // events:
    Stage.EVENT_MOUSE_LEAVE = 'mouseleave';
    Stage.EVENT_MOUSE_ENTER = 'mouseenter';
    Stage.EVENT_STAGE_MOUSE_MOVE = 'stagemousemove';
    return Stage;
}(Container_1.Container));
exports.Stage = Stage;
