/*
 * Text
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
var Rectangle_1 = require("../geom/Rectangle");
var Methods = require("../util/Methods");
/**
 * @module easelts
 */
/**
 * Display one or more lines of dynamic text (not user editable) in the display list. Line wrapping support (using the
 * lineWidth) is very basic, wrapping on spaces and tabs only. Note that as an alternative to Text, you can position HTML
 * text above or below the canvas relative to items in the display list using the {{#crossLink "DisplayObject/localToGlobal"}}{{/crossLink}}
 * method, or using {{#crossLink "DOMElement"}}{{/crossLink}}.
 *
 * *Please note that Text does not support HTML text, and can only display one font style at a time.* To use
 * multiple font styles, you will need to create multiple text instances, and position them manually.
 *
 * #### Example
 *
 * '''
 * var text = new createjs.Text("Hello World", "20px Arial", "#ff7700");
 * text.x = 100;
 * text.textBaseline = "alphabetic";
 * '''
 *
 * @author Mient-jan Stelling <mientjan.stelling@gmail.com>
 * @namespace easelts.display
 * @class Text
 * @extends DisplayObject
 * @constructor
 * @param {String} [text] The text to display.
 * @param {String} [font] The font style to use. Any valid value for the CSS font attribute is acceptable (ex. "bold 36px Arial").
 * @param {String} [color] The color to draw the text in. Any valid value for the CSS color attribute is acceptable (ex. "#F00", "red", or "#FF0000").
 */
var Text = (function (_super) {
    __extends(Text, _super);
    /**
     * @method constructor
     * @param {String} [text] The text to display.
     * @param {String} [font] The font style to use. Any valid value for the CSS font attribute is acceptable (ex. "bold
     * 36px Arial").
     * @param {String} [color] The color to draw the text in. Any valid value for the CSS color attribute is acceptable (ex.
     * "#F00", "red", or "#FF0000").
     * @protected
     */
    function Text(text, font, color, width, height, x, y, regX, regY) {
        if (font === void 0) { font = '10px sans-serif'; }
        if (color === void 0) { color = '#000000'; }
        if (width === void 0) { width = 1; }
        if (height === void 0) { height = 1; }
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (regX === void 0) { regX = 0; }
        if (regY === void 0) { regY = 0; }
        _super.call(this, width, height, x, y, regX, regY);
        this.isDebugMode = false;
        this._text = "";
        /**
         * The font style to use. Any valid value for the CSS font attribute is acceptable (ex. "bold 36px Arial").
         * @property font
         * @type String
         **/
        this.font = null;
        /**
         * The color to draw the text in. Any valid value for the CSS color attribute is acceptable (ex. "#F00"). Default is "#000".
         * It will also accept valid canvas fillStyle values.
         * @property color
         * @type String
         **/
        this.color = null;
        /**
         * The horizontal text alignment. Any of "start", "end", "left", "right", and "center". For detailed
         * information view the
         * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#text-styles">
         * whatwg spec</a>. Default is "left".
         * @property textAlign
         * @type String
         **/
        this.textAlign = Text.TEXT_ALIGN_LEFT;
        /**
         * The vertical alignment point on the font. Any of "top", "hanging", "middle", "alphabetic", "ideographic", or
         * "bottom". For detailed information view the <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#text-styles">
         * whatwg spec</a>. Default is "top".
         * @property textBaseline
         * @type String
         */
        this.textBaseline = Text.TEXT_BASELINE_TOP;
        /**
         * The maximum width to draw the text. If maxWidth is specified (not null), the text will be condensed or
         * shrunk to make it fit in this width. For detailed information view the
         * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#text-styles">
         * whatwg spec</a>.
         * @property maxWidth
         * @type Number
         */
        this.maxWidth = null;
        /**
         * If greater than 0, the text will be drawn as a stroke (outline) of the specified width.
         * @property outline
         * @type Number
         **/
        this.outline = 0;
        /**
         * Indicates the line height (vertical distance between baselines) for multi-line text. If null or 0,
         * the value of getMeasuredLineHeight is used.
         * @property lineHeight
         * @type Number
         **/
        this.lineHeight = 0;
        /**
         * Indicates the maximum width for a line of text before it is wrapped to multiple lines. If null,
         * the text will not be wrapped.
         * @property lineWidth
         * @type Number
         **/
        this.lineWidth = null;
        this._autoWidth = false;
        this._autoHeight = false;
        // positioning is wrong when a text draw call has no text.
        if (text.length == 0) {
            text = " ";
        }
        this.text = text;
        this.font = font;
        this.color = color;
    }
    Object.defineProperty(Text.prototype, "text", {
        get: function () {
            return this._text;
        },
        // public properties:
        /**
         * The text to display.
         * @property text
         * @type String
         **/
        set: function (value) {
            // replace space before and after newlines
            value = value.replace(/\s+\n|\n\s+/g, "\n");
            if (this._text != value) {
                this._text = value;
                if (this._autoWidth) {
                    this.setWidth('auto');
                }
                if (this._autoHeight) {
                    this.setHeight('auto');
                }
            }
            this.dispatchEvent(Text.EVENT_ON_TEXT_CHANGE);
        },
        enumerable: true,
        configurable: true
    });
    Text.prototype.setWidth = function (value) {
        if (value == 'auto') {
            this._autoWidth = true;
            _super.prototype.setWidth.call(this, this.getBounds().width);
        }
        else {
            this._autoWidth = false;
            _super.prototype.setWidth.call(this, value);
        }
    };
    Text.prototype.setHeight = function (value) {
        if (value == 'auto') {
            this._autoHeight = true;
            _super.prototype.setHeight.call(this, this.getMeasuredHeight());
        }
        else {
            this._autoHeight = false;
            _super.prototype.setHeight.call(this, value);
        }
    };
    /**
     * Returns true or false indicating whether the display object would be visible if drawn to a canvas.
     * This does not account for whether it would be visible within the boundaries of the stage.
     * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
     * @method isVisible
     * @return {Boolean} Whether the display object would be visible if drawn to a canvas
     **/
    Text.prototype.isVisible = function () {
        var hasContent = this.cacheCanvas || (this.text != null && this.text !== "");
        return !!(this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && hasContent);
    };
    /**
     * Draws the Text into the specified context ignoring its visible, alpha, shadow, and transform.
     * Returns true if the draw was handled (useful for overriding functionality).
     * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
     * @method draw
     * @param {CanvasRenderingContext2D} ctx The canvas 2D context object to draw into.
     * @param {Boolean} ignoreCache Indicates whether the draw operation should ignore any current cache.
     * For example, used for drawing the cache (to prevent it from simply drawing an existing cache back
     * into itself).
     **/
    Text.prototype.draw = function (ctx, ignoreCache) {
        if (_super.prototype.draw.call(this, ctx, ignoreCache)) {
            return true;
        }
        var col = this.color || "#000";
        if (this.outline) {
            ctx.strokeStyle = col;
            ctx.lineWidth = this.outline * 1;
        }
        else {
            ctx.fillStyle = col;
        }
        this._drawText(this._prepContext(ctx));
        ctx.save();
        if (this.isDebugMode) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFF';
            ctx.rect(0, 0, this.width, this.height);
            ctx.stroke();
        }
        ctx.restore();
        return true;
    };
    /**
     * Returns the measured, untransformed width of the text without wrapping. Use getBounds for a more robust value.
     * @method getMeasuredWidth
     * @return {Number} The measured, untransformed width of the text.
     **/
    Text.prototype.getMeasuredWidth = function () {
        return this._drawText(null, {}).width;
    };
    /**
     * Returns the exact size of the text.
     * Bewarned this a really heave task and should only be done with extreem caution.
     *
     * @method getExactSize
     * @returns Bounds
     */
    Text.prototype.getExactSize = function () {
        var width = Math.ceil(this.getMeasuredWidth());
        var height = Math.ceil(this.getMeasuredHeight() * 1.4);
        var rowHeight = Math.ceil(this._getMeasuredWidth('M') * 2);
        var cacheArguments = null;
        var color = this.color;
        this.color = '#00000';
        var y = 0;
        var x = 0;
        switch (this.textAlign) {
            case Text.TEXT_ALIGN_CENTER:
                {
                    x = -width / 2;
                    break;
                }
            case Text.TEXT_ALIGN_END:
            case Text.TEXT_ALIGN_RIGHT:
                {
                    x = -width;
                    break;
                }
        }
        switch (this.textBaseline) {
            case Text.TEXT_BASELINE_ALPHABETIC:
                {
                    y = -rowHeight;
                    break;
                }
            case Text.TEXT_BASELINE_BOTTOM:
                {
                    y = -rowHeight;
                    break;
                }
            case Text.TEXT_BASELINE_TOP:
            case Text.TEXT_BASELINE_HANGING:
                {
                    //y = height;
                    break;
                }
            case Text.TEXT_BASELINE_IDEOGRAPHIC:
                {
                    y = -rowHeight;
                    break;
                }
            case Text.TEXT_BASELINE_MIDDLE:
                {
                    y = -rowHeight / 2;
                    break;
                }
        }
        if (this.cacheCanvas) {
            cacheArguments = [this._cacheX, this._cacheY, this._cacheWidth, this._cacheHeight, this._cacheScale];
        }
        this.cache(x, y, width, height, 1);
        var ctx = this.cacheCanvas.getContext();
        var img = ctx.getImageData(0, 0, width, height);
        if (cacheArguments) {
            this.cache.apply(this, cacheArguments);
        }
        else {
            this.uncache();
        }
        var data = img.data, x0 = width, y0 = height, x1 = 0, y1 = 0;
        for (var i = 3, l = data.length, p = 0; i < l; i += 4, ++p) {
            var px = p % width;
            var py = Math.floor(p / width);
            if (data[i - 3] > 0 ||
                data[i - 2] > 0 ||
                data[i - 1] > 0 ||
                data[i] > 0) {
                x0 = Math.min(x0, px);
                y0 = Math.min(y0, py);
                x1 = Math.max(x1, px);
                y1 = Math.max(y1, py);
            }
        }
        this.color = color;
        x0 += x;
        y0 += y;
        x1 += x;
        y1 += y;
        return new Rectangle_1.Rectangle(x0, y0, x1 - x0, y1 - y0);
    };
    /**
     * Returns an approximate line height of the text, ignoring the lineHeight property. This is based on the measured
     * width of a "M" character multiplied by 1.2, which provides an approximate line height for most fonts.
     * @method getMeasuredLineHeight
     * @return {Number} an approximate line height of the text, ignoring the lineHeight property. This is
     * based on the measured width of a "M" character multiplied by 1.2, which approximates em for most fonts.
     **/
    Text.prototype.getMeasuredLineHeight = function () {
        return this._getMeasuredWidth("M") * 1.2;
    };
    /**
     * Returns the approximate height of multi-line text by multiplying the number of lines against either the
     * <code>lineHeight</code> (if specified) or {{#crossLink "Text/getMeasuredLineHeight"}}{{/crossLink}}. Note that
     * this operation requires the text flowing logic to run, which has an associated CPU cost.
     * @method getMeasuredHeight
     * @return {Number} The approximate height of the untransformed multi-line text.
     **/
    Text.prototype.getMeasuredHeight = function () {
        return this._drawText(null, {}).height;
    };
    /**
     * Docced in superclass.
     */
    Text.prototype.getBounds = function () {
        var rect = _super.prototype.getBounds.call(this);
        if (rect) {
            return rect;
        }
        if (this.text == null || this.text == "") {
            return null;
        }
        var o = this._drawText(null, {});
        var w = (this.maxWidth && this.maxWidth < o.width) ? this.maxWidth : o.width;
        var x = w * Text.H_OFFSETS[this.textAlign];
        var lineHeight = this.lineHeight || this.getMeasuredLineHeight();
        var y = lineHeight * Text.V_OFFSETS[this.textBaseline];
        return this._rectangle.setProperies(x, y, w, o.height);
    };
    /**
     * Returns an object with width, height, and lines properties. The width and height are the visual width and height
     * of the drawn text. The lines property contains an array of strings, one for
     * each line of text that will be drawn, accounting for line breaks and wrapping. These strings have trailing
     * whitespace removed.
     * @method getMetrics
     * @return {Object} An object with width, height, and lines properties.
     **/
    Text.prototype.getMetrics = function () {
        var o = { lines: [] };
        o.lineHeight = this.lineHeight || this.getMeasuredLineHeight();
        o.vOffset = o.lineHeight * Text.V_OFFSETS[this.textBaseline];
        return this._drawText(null, o, o.lines);
    };
    /**
     * Returns a clone of the Text instance.
     * @method clone
     * @return {Text} a clone of the Text instance.
     **/
    Text.prototype.clone = function () {
        var o = new Text(this.text, this.font, this.color);
        this.cloneProps(o);
        return o;
    };
    /**
     * Returns a string representation of this object.
     * @method toString
     * @return {String} a string representation of the instance.
     **/
    Text.prototype.toString = function () {
        return "[Text (text=" + (this.text.length > 20 ? this.text.substr(0, 17) + "..." : this.text) + ")]";
    };
    // private methods:
    /**
     * @method cloneProps
     * @param {Text} o
     * @protected
     **/
    Text.prototype.cloneProps = function (o) {
        _super.prototype.cloneProps.call(this, o);
        o.textAlign = this.textAlign;
        o.textBaseline = this.textBaseline;
        o.maxWidth = this.maxWidth;
        o.outline = this.outline;
        o.lineHeight = this.lineHeight;
        o.lineWidth = this.lineWidth;
    };
    /**
     * @method _getWorkingContext
     * @param {CanvasRenderingContext2D} ctx
     * @return {CanvasRenderingContext2D}
     * @protected
     **/
    Text.prototype._prepContext = function (ctx) {
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        return ctx;
    };
    /**
     * Draws multiline text.
     *
     * @todo define what {Object} o actual is.
     *
     * @method _drawText
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} o
     * @param {Array} lines
     * @return {Object}
     * @protected
     **/
    Text.prototype._drawText = function (ctx, o, lines) {
        var paint = !!ctx;
        if (!paint) {
            ctx = Text._workingContext;
            ctx.save();
            this._prepContext(ctx);
        }
        var lineHeight = this.lineHeight || this.getMeasuredLineHeight();
        var maxW = 0, count = 0;
        var hardLines = String(this._text).split(/(?:\r\n|\r|\n)/);
        for (var i = 0, l = hardLines.length; i < l; i++) {
            var str = hardLines[i];
            var w = null;
            if (this.lineWidth != null && (w = ctx.measureText(str).width) > this.lineWidth) {
                // text wrapping:
                var words = str.split(/(\s)/);
                str = words[0];
                w = ctx.measureText(str).width;
                for (var j = 1, jl = words.length; j < jl; j += 2) {
                    // Line needs to wrap:
                    var wordW = ctx.measureText(words[j] + words[j + 1]).width;
                    if (w + wordW > this.lineWidth) {
                        if (paint) {
                            this._drawTextLine(ctx, str, count * lineHeight);
                        }
                        if (lines) {
                            lines.push(str);
                        }
                        if (w > maxW) {
                            maxW = w;
                        }
                        str = words[j + 1];
                        w = ctx.measureText(str).width;
                        count++;
                    }
                    else {
                        str += words[j] + words[j + 1];
                        w += wordW;
                    }
                }
            }
            if (paint) {
                this._drawTextLine(ctx, str, count * lineHeight);
            }
            if (lines) {
                lines.push(str);
            }
            if (o && w == null) {
                w = ctx.measureText(str).width;
            }
            if (w > maxW) {
                maxW = w;
            }
            count++;
        }
        if (o) {
            o.width = maxW;
            o.height = count * lineHeight;
        }
        if (!paint) {
            ctx.restore();
        }
        return o;
    };
    /**
     * @method _drawTextLine
     * @param {CanvasRenderingContext2D} ctx
     * @param {String} text
     * @param {Number} y
     * @protected
     **/
    Text.prototype._drawTextLine = function (ctx, text, y) {
        // Chrome 17 will fail to draw the text if the last param is included but null, so we feed it a large value instead:
        if (this.outline) {
            ctx.strokeText(text, 0, y, this.maxWidth || 0xFFFF);
        }
        else {
            ctx.fillText(text, 0, y, this.maxWidth || 0xFFFF);
        }
    };
    /**
     * @method _getMeasuredWidth
     * @param {String} text
     * @protected
     **/
    Text.prototype._getMeasuredWidth = function (text) {
        var ctx = Text._workingContext;
        ctx.save();
        var w = this._prepContext(ctx).measureText(text).width;
        ctx.restore();
        return w;
    };
    Text.EVENT_ON_TEXT_CHANGE = 'onTextChange';
    /**
     *
     */
    Text.TEXT_BASELINE_TOP = 'top';
    Text.TEXT_BASELINE_HANGING = 'hanging';
    Text.TEXT_BASELINE_MIDDLE = 'middle';
    Text.TEXT_BASELINE_ALPHABETIC = 'alphabetic';
    Text.TEXT_BASELINE_IDEOGRAPHIC = 'ideographic';
    Text.TEXT_BASELINE_BOTTOM = 'bottom';
    /**
     *
     */
    Text.TEXT_ALIGN_START = 'start';
    Text.TEXT_ALIGN_END = 'end';
    Text.TEXT_ALIGN_LEFT = 'left';
    Text.TEXT_ALIGN_RIGHT = 'right';
    Text.TEXT_ALIGN_CENTER = 'center';
    Text.TEXT_ALIGN_BOTTOM = 'bottom';
    /**
     * Lookup table for the ratio to offset bounds x calculations based on the textAlign property.
     * @property H_OFFSETS
     * @type Object
     * @protected
     * @static
     **/
    Text.H_OFFSETS = { start: 0, left: 0, center: -0.5, end: -1, right: -1 };
    /**
     * Lookup table for the ratio to offset bounds y calculations based on the textBaseline property.
     * @property H_OFFSETS
     * @type Object
     * @protected
     * @static
     **/
    Text.V_OFFSETS = { top: 0, hanging: -0.01, middle: -0.4, alphabetic: -0.8, ideographic: -0.85, bottom: -1 };
    return Text;
}(DisplayObject_1.DisplayObject));
exports.Text = Text;
/**
 * @property _workingContext
 * @type CanvasRenderingContext2D
 * @private
 **/
var canvas = Methods.createCanvas();
if (canvas.getContext) {
    Text._workingContext = canvas.getContext("2d");
    canvas.width = canvas.height = 1;
}
