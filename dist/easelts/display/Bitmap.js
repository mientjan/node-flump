/*
 * Bitmap
 *
 * Copyright (c) 2010 gskinner.com, inc.
 * Copyright (c) 2014-2015 Mient-jan Stelling.
 * Copyright (c) 2015 mediamonks.com
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
var DisplayObject_1 = require("./DisplayObject");
var Texture_1 = require("./Texture");
var Rectangle_1 = require("../geom/Rectangle");
/**
 * A Bitmap represents an Image, Canvas, or Video in the display list. A Bitmap can be instantiated using an existing
 * HTML element, or a string.
 *
 * <h4>Example</h4>
 *
 *      var bitmap = new createjs.Bitmap("imagePath.jpg");
 *
 * <strong>Notes:</strong>
 * <ol>
 *     <li>When a string path or image tag that is not yet loaded is used, the stage may need to be redrawn before it
 *      will be displayed.</li>
 *     <li>Bitmaps with an SVG source currently will not respect an alpha value other than 0 or 1. To get around this,
 *     the Bitmap can be cached.</li>
 *     <li>Bitmaps with an SVG source will taint the canvas with cross-origin data, which prevents interactivity. This
 *     happens in all browsers except recent Firefox builds.</li>
 *     <li>Images loaded cross-origin will throw cross-origin security errors when interacted with using a mouse, using
 *     methods such as `getObjectUnderPoint`, or using filters, or caching. You can get around this by setting
 *     `crossOrigin` flags on your images before passing them to EaselJS, eg: `img.crossOrigin="Anonymous";`</li>
 * </ol>
 *
 * @class Bitmap
 * @extends DisplayObject
 * @constructor
 * @author Mient-jan Stelling <mientjan.stelling@gmail.com>
 * @param {Image | HTMLCanvasElement | HTMLVideoElement | String} imageOrUri The source object or URI to an image to
 * display. This can be either an Image, Canvas, or Video object, or a string URI to an image file to load and use.
 * If it is a URI, a new Image object will be constructed and assigned to the .image property.
 **/
var Bitmap = (function (_super) {
    __extends(Bitmap, _super);
    /**
     * @class Bitmap
     * @constructor
     * @param {HTMLImageElement|HTMLCanvasElement|string} imageOrUri The source object or URI to an image to
     * display. This can be either an Image, Canvas, or Video object, or a string URI to an image file to load and use.
     * If it is a URI, a new Image object will be constructed and assigned to the `.image` property.
     * @param {string|number} width
     * @param {string|number} height
     * @param {string|number} x
     * @param {string|number} y
     * @param {string|number} regX
     * @param {string|number} regY
     */
    function Bitmap(imageOrUri, width, height, x, y, regX, regY) {
        if (width === void 0) { width = 0; }
        if (height === void 0) { height = 0; }
        _super.call(this, width, height, x, y, regX, regY);
        this.type = 32 /* BITMAP */;
        /**
         * The image to render. This can be an Image, a Canvas, or a Video.
         * @property image
         * @type HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
         **/
        this.source = null;
        // protected _imageNaturalWidth:number = null;
        // protected _imageNaturalHeight:number = null;
        this._isTiled = false;
        /**
         * Specifies an area of the source image to draw. If omitted, the whole image will be drawn.
         * @property sourceRect
         * @type Rectangle
         * @default null
         */
        this.sourceRect = null;
        /**
         * Specifies an area of the destination will be drawn to.
         * @property destinationRect
         * @type Rectangle
         * @default null
         */
        this.destinationRect = null;
        if (typeof imageOrUri == 'string') {
            this.source = Texture_1.Texture.createFromString(imageOrUri, false);
        }
        else if (imageOrUri instanceof Texture_1.Texture) {
            this.source = imageOrUri;
        }
        else {
            this.source = new Texture_1.Texture(imageOrUri);
        }
        this.source.load();
    }
    Bitmap.prototype.hasLoaded = function () {
        return this.source.hasLoaded();
    };
    /**
     * @method load
     * @param onProgress
     * @returns {Promise<Bitmap>}
     */
    Bitmap.prototype.load = function (onProgress) {
        var _this = this;
        return this.source.load(onProgress).then(function () {
            return _this;
        });
    };
    /**
     * Returns true or false indicating whether the display object would be visible if drawn to a canvas.
     * This does not account for whether it would be visible within the boundaries of the stage.
     *
     * @method isVisible
     * @return {Boolean} Boolean indicating whether the display object would be visible if drawn to a canvas
     **/
    Bitmap.prototype.isVisible = function () {
        var hasContent = this.cacheCanvas || this.hasLoaded();
        return !!(this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && hasContent);
    };
    /**
     * Draws the display object into the specified context ignoring its visible, alpha, shadow, and transform.
     * Returns true if the draw was handled (useful for overriding functionality).
     *
     * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
     * @method draw
     * @param {CanvasRenderingContext2D} ctx The canvas 2D context object to draw into.
     * @param {Boolean} [ignoreCache=false] Indicates whether the draw operation should ignore any current cache.
     * For example, used for drawing the cache (to prevent it from simply drawing an existing cache back
     * into itself).
     * @return {Boolean}
     **/
    Bitmap.prototype.draw = function (ctx, ignoreCache) {
        if (_super.prototype.draw.call(this, ctx, ignoreCache)) {
            return true;
        }
        var sourceRect = this.sourceRect;
        var destRect = this.destinationRect;
        var width = this.width;
        var height = this.height;
        var source = this.source;
        if (sourceRect && !destRect) {
            source.draw(ctx, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, 0, 0, width, height);
        }
        else if (!sourceRect && destRect) {
            source.draw(ctx, 0, 0, source.getWidth(), source.getHeight(), destRect.x, destRect.y, destRect.width, destRect.height);
        }
        else if (sourceRect && destRect) {
            source.draw(ctx, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, destRect.x, destRect.y, destRect.width, destRect.height);
        }
        else {
            if (!width) {
                width = source.width;
            }
            if (!height) {
                height = source.height;
            }
            source.draw(ctx, 0, 0, source.getWidth(), source.getHeight(), 0, 0, width, height);
        }
        return true;
    };
    /**
     * Docced in superclass.
     */
    Bitmap.prototype.getBounds = function () {
        var rect = _super.prototype.getBounds.call(this);
        if (rect) {
            return rect;
        }
        return new Rectangle_1.Rectangle(this.x, this.y, this.width, this.height);
    };
    /**
     * returns source size of texture
     * @returns {Size}
     */
    Bitmap.prototype.getImageSize = function () {
        if (!this.hasLoaded()) {
            throw new Error('bitmap has not yet been loaded, getImageSize can only be called when bitmap has been loaded');
        }
        return this.source.getSize();
    };
    /**
     * Returns a clone of the Bitmap instance.
     * @method clone
     * @return {Bitmap} a clone of the Bitmap instance.
     **/
    Bitmap.prototype.clone = function () {
        var o = new Bitmap(this.source);
        if (this.sourceRect)
            o.sourceRect = this.sourceRect.clone();
        if (this.destinationRect)
            o.destinationRect = this.destinationRect.clone();
        this.cloneProps(o);
        return o;
    };
    /**
     * Returns a string representation of this object.
     * @method toString
     * @return {String} a string representation of the instance.
     **/
    Bitmap.prototype.toString = function () {
        return "[Bitmap (name=" + this.name + ")]";
    };
    Bitmap.prototype.destruct = function () {
        this.source.destruct();
        this.source = null;
        this.sourceRect = null;
        this.destinationRect = null;
        _super.prototype.destruct.call(this);
    };
    return Bitmap;
}(DisplayObject_1.DisplayObject));
exports.Bitmap = Bitmap;
