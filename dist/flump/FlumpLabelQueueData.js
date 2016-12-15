"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var FlumpLabelData_1 = require("./FlumpLabelData");
var FlumpLabelQueueData = (function (_super) {
    __extends(FlumpLabelQueueData, _super);
    function FlumpLabelQueueData(label, index, duration, times, delay) {
        if (times === void 0) { times = 1; }
        if (delay === void 0) { delay = 0; }
        var _this = _super.call(this, label, index, duration) || this;
        _this.times = times;
        _this.delay = delay;
        return _this;
    }
    FlumpLabelQueueData.prototype.then = function (complete) {
        this._complete = complete;
        return this;
    };
    FlumpLabelQueueData.prototype.finish = function () {
        if (this._complete) {
            this._complete.call(this);
        }
        return this;
    };
    FlumpLabelQueueData.prototype.destruct = function () {
        this.label = null;
        this._complete = null;
    };
    return FlumpLabelQueueData;
}(FlumpLabelData_1.FlumpLabelData));
exports.FlumpLabelQueueData = FlumpLabelQueueData;
