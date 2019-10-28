"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file IndexedDB compatibility checker
 */
var formatted_result_1 = require("./formatted_result");
exports.default = {
    getResult: function () {
        if (!window) {
            return formatted_result_1.default['DB_NOT_SUPPORT'].setData({
                desc: 'idb-managed can not run in non-browser environment'
            });
        }
        try {
            [
                'indexedDB',
                'IDBDatabase',
                'IDBObjectStore',
                'IDBTransaction',
                'IDBIndex',
                'IDBCursor',
                'IDBKeyRange'
            ].forEach(function (property) {
                if (!window.hasOwnProperty(property)) {
                    throw formatted_result_1.default['DB_NOT_SUPPORT'].setData({
                        desc: property + " is not supported in window"
                    });
                }
            });
            return formatted_result_1.default['SUCC'];
        }
        catch (resultOb) {
            return resultOb;
        }
    }
};
