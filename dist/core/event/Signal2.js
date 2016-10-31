/*
 * Signal2
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
var SignalAbstract_1 = require("./SignalAbstract");
/**
 * @namespace createts.events
 * @module createts
 * @class Signal2
 */
var Signal2 = (function (_super) {
    __extends(Signal2, _super);
    function Signal2() {
        _super.apply(this, arguments);
    }
    /**
     * Emit the signal, notifying each connected listener.
     *
     * @method emit
     */
    Signal2.prototype.emit = function (arg1, arg2) {
        var _this = this;
        if (this.dispatching()) {
            this.defer(function () { return _this.emitImpl(arg1, arg2); });
        }
        else {
            this.emitImpl(arg1, arg2);
        }
    };
    Signal2.prototype.emitImpl = function (arg1, arg2) {
        var head = this.willEmit();
        var p = head;
        while (p != null) {
            p._listener(arg1, arg2);
            if (!p.stayInList) {
                p.dispose();
            }
            p = p._next;
        }
        this.didEmit(head);
    };
    return Signal2;
}(SignalAbstract_1.SignalAbstract));
exports.Signal2 = Signal2;
