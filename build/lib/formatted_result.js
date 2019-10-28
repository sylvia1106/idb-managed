"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file Provide unified formatted result for idb-managed
 */
var ResultFormatter = /** @class */ (function () {
    function ResultFormatter(theCode, theMsg) {
        this.code = theCode;
        this.msg = theMsg;
    }
    ResultFormatter.prototype.setData = function (supplyment) {
        this.data = __assign(__assign({}, this.data), supplyment);
        return this;
    };
    ResultFormatter.prototype.toString = function () {
        return "FormattedResult{code: " + this.code + ", msg: " + this.msg + ", data: " + JSON.stringify(this.data) + "}";
    };
    return ResultFormatter;
}());
exports.ResultFormatter = ResultFormatter;
exports.default = {
    get DB_NOT_SUPPORT() {
        return new ResultFormatter(100, 'IndexedDB is not supported');
    },
    get PARAM_INVALID() {
        return new ResultFormatter(101, 'Invalid parameter');
    },
    get SUCC() {
        return new ResultFormatter(200, 'Successfully done');
    },
    get DB_NOT_FOUND() {
        return new ResultFormatter(201, 'DB does not exist');
    },
    get TABLE_NOT_FOUND() {
        return new ResultFormatter(202, 'Table does not exist');
    },
    get OPEN_DB_FAIL() {
        return new ResultFormatter(203, 'Open DB failed');
    },
    get ADD_ITEMS_FAIL() {
        return new ResultFormatter(204, 'Add items failed');
    },
    get GET_ITEM_FAIL() {
        return new ResultFormatter(205, 'Get item failed');
    },
    get GET_IN_RANGE_FAIL() {
        return new ResultFormatter(206, 'Get items in range failed');
    },
    get DELETE_ITEMS_FAIL() {
        return new ResultFormatter(207, 'Delete items failed');
    },
    get DELETE_DB_FAIL() {
        return new ResultFormatter(208, 'Delete DB failed');
    },
    get UNEXPECTED_ERR() {
        return new ResultFormatter(666, 'Some unexpected error happens');
    }
};
