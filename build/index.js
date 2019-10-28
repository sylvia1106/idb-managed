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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var db_env_checker_1 = require("./lib/db_env_checker");
var formatted_result_1 = require("./lib/formatted_result");
var db_wrapper_1 = require("./db_wrapper");
var utils_1 = require("./lib/utils");
var DEFAULT_DB_VERSION = 1;
var OPTIONAL = true;
function _customDBConfigChecker(dbConfig) {
    utils_1.paramChecker(dbConfig, utils_1.ParamCheckerEnum.NotNullObject, 'dbConfig', !OPTIONAL);
    utils_1.paramChecker(dbConfig.dbName, utils_1.ParamCheckerEnum.String, 'dbName', !OPTIONAL);
    utils_1.paramChecker(dbConfig.dbVersion, utils_1.ParamCheckerEnum.NonNegativeInteger, 'dbVersion', OPTIONAL);
    utils_1.paramChecker(dbConfig.itemDuration, utils_1.ParamCheckerEnum.NonNegativeInteger, 'itemDuration of dbConfig', OPTIONAL);
    utils_1.paramChecker(dbConfig.tables, utils_1.ParamCheckerEnum.NotNullObject, 'tables', OPTIONAL);
    Object.keys(dbConfig.tables || {}).forEach(function (tableName) {
        var tableConfig = dbConfig.tables[tableName];
        utils_1.paramChecker(tableConfig.primaryKey, utils_1.ParamCheckerEnum.String, 'primaryKey', OPTIONAL);
        utils_1.paramChecker(tableConfig.itemDuration, utils_1.ParamCheckerEnum.NonNegativeInteger, 'itemDuration of table', OPTIONAL);
        utils_1.paramChecker(tableConfig.indexList, utils_1.ParamCheckerEnum.Array, 'indexList', OPTIONAL);
        (tableConfig.indexList || []).forEach(function (index) {
            utils_1.paramChecker(index.indexName, utils_1.ParamCheckerEnum.String, 'indexName', !OPTIONAL);
            utils_1.paramChecker(index.unique, utils_1.ParamCheckerEnum.Boolean, 'unique', OPTIONAL);
        });
    });
}
function _customDBAddItemsParamChecker(items, tableListInDB) {
    utils_1.paramChecker(items, utils_1.ParamCheckerEnum.Array, 'items', !OPTIONAL);
    items.forEach(function (itemOfTable) {
        utils_1.paramChecker(itemOfTable.tableName, utils_1.ParamCheckerEnum.String, "item's tableName", !OPTIONAL);
        utils_1.paramChecker(itemOfTable.itemDuration, utils_1.ParamCheckerEnum.NonNegativeInteger, "item's itemDuration", OPTIONAL);
        var theTable = tableListInDB.find(function (table) { return table.tableName === itemOfTable.tableName; });
        if (!theTable) {
            throw "Table " + itemOfTable.tableName + " does not exist";
        }
        else if (theTable.primaryKey !== undefined &&
            Object.getOwnPropertyNames(itemOfTable.item).indexOf(theTable.primaryKey) < 0) {
            throw "primaryKey is needed for item in table " + itemOfTable.tableName;
        }
    });
}
function tableIndexRangeParamChecker(tableIndexRange) {
    utils_1.paramChecker(tableIndexRange, utils_1.ParamCheckerEnum.NotNullObject, 'tableIndexRange', !OPTIONAL);
    utils_1.paramChecker(tableIndexRange.tableName, utils_1.ParamCheckerEnum.String, "tableIndexRange's", !OPTIONAL);
    utils_1.paramChecker(tableIndexRange.indexRange, utils_1.ParamCheckerEnum.NotNullObject, "tableIndexRange's indexRange", OPTIONAL);
    if (tableIndexRange.indexRange) {
        var _a = tableIndexRange.indexRange, indexName = _a.indexName, lowerExclusive = _a.lowerExclusive, upperExclusive = _a.upperExclusive;
        utils_1.paramChecker(indexName, utils_1.ParamCheckerEnum.String, "indexRange's indexName", !OPTIONAL);
        utils_1.paramChecker(lowerExclusive, utils_1.ParamCheckerEnum.Boolean, "indexRange's lowerExclusive", OPTIONAL);
        utils_1.paramChecker(upperExclusive, utils_1.ParamCheckerEnum.Boolean, "indexRange's upperExclusive", OPTIONAL);
    }
}
function idbIsSupported() {
    var supportResult = db_env_checker_1.default.getResult();
    return supportResult !== formatted_result_1.default['DB_NOT_SUPPORT'];
}
exports.idbIsSupported = idbIsSupported;
var CustomDB = /** @class */ (function () {
    function CustomDB(dbConfig) {
        try {
            _customDBConfigChecker(dbConfig);
        }
        catch (errMsg) {
            throw formatted_result_1.default['PARAM_INVALID'].setData({
                desc: "" + errMsg
            });
        }
        this.name = dbConfig.dbName;
        this.version = utils_1.optionWithBackup(dbConfig.dbVersion, DEFAULT_DB_VERSION);
        this.tableList = Object.keys(dbConfig.tables || {}).map(function (tableName) {
            return __assign({ tableName: tableName }, dbConfig.tables[tableName]);
        });
        this.itemDuration = dbConfig.itemDuration;
    }
    CustomDB.prototype.addItems = function (items) {
        return __awaiter(this, void 0, void 0, function () {
            var itemDurationOverrider, itemsWithDuration, e_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        itemDurationOverrider = function (ofDB, ofTable, ofItem) {
                            if (ofItem !== undefined) {
                                return ofItem;
                            }
                            else if (ofTable !== undefined) {
                                return ofTable;
                            }
                            else {
                                return ofDB;
                            }
                        };
                        try {
                            _customDBAddItemsParamChecker(items, this.tableList);
                        }
                        catch (errMsg) {
                            throw formatted_result_1.default['PARAM_INVALID'].setData({
                                desc: "" + errMsg
                            });
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        itemsWithDuration = items.map(function (item) {
                            var theTable = _this.tableList.find(function (table) { return table.tableName === item.tableName; });
                            return __assign({
                                itemDuration: itemDurationOverrider(_this.itemDuration, theTable.itemDuration, item.itemDuration)
                            }, item);
                        });
                        return [4 /*yield*/, db_wrapper_1.default.addItems(this, itemsWithDuration)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, formatted_result_1.default['SUCC']];
                    case 3:
                        e_1 = _a.sent();
                        throw formatted_result_1.default['ADD_ITEMS_FAIL'].setData({
                            desc: "" + e_1
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CustomDB.prototype.getItem = function (tableName, primaryKeyValue) {
        return __awaiter(this, void 0, void 0, function () {
            var e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_wrapper_1.default.getItem(this.name, tableName, primaryKeyValue)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        e_2 = _a.sent();
                        throw formatted_result_1.default['GET_ITEM_FAIL'].setData({
                            desc: "" + e_2
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CustomDB.prototype.getItemsInRange = function (tableIndexRange) {
        return __awaiter(this, void 0, void 0, function () {
            var e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            tableIndexRangeParamChecker(tableIndexRange);
                        }
                        catch (errMsg) {
                            throw formatted_result_1.default['PARAM_INVALID'].setData({
                                desc: "" + errMsg
                            });
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, db_wrapper_1.default.getItemsInRange(this.name, tableIndexRange)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        e_3 = _a.sent();
                        throw formatted_result_1.default['GET_IN_RANGE_FAIL'].setData({
                            desc: "" + e_3
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CustomDB.prototype.deleteItemsInRange = function (tableIndexRanges) {
        return __awaiter(this, void 0, void 0, function () {
            var e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            utils_1.paramChecker(tableIndexRanges, utils_1.ParamCheckerEnum.Array, 'tableIndexRanges', !OPTIONAL);
                            tableIndexRanges.forEach(function (tableIndexRange) {
                                tableIndexRangeParamChecker(tableIndexRange);
                            });
                        }
                        catch (errMsg) {
                            throw formatted_result_1.default['PARAM_INVALID'].setData({
                                desc: "" + errMsg
                            });
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, db_wrapper_1.default.deleteItems(this.name, tableIndexRanges)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, formatted_result_1.default['SUCC']];
                    case 3:
                        e_4 = _a.sent();
                        throw formatted_result_1.default['DELETE_ITEMS_FAIL'].setData({
                            desc: "" + e_4
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CustomDB;
}());
exports.CustomDB = CustomDB;
function deleteDB(dbName) {
    return __awaiter(this, void 0, void 0, function () {
        var e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    try {
                        utils_1.paramChecker(dbName, utils_1.ParamCheckerEnum.String, 'dbName', !OPTIONAL);
                    }
                    catch (errMsg) {
                        throw formatted_result_1.default['PARAM_INVALID'].setData({
                            desc: "" + errMsg
                        });
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, db_wrapper_1.default.deleteDB(dbName)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, formatted_result_1.default['SUCC']];
                case 3:
                    e_5 = _a.sent();
                    throw formatted_result_1.default['DELETE_DB_FAIL'].setData({
                        desc: "" + e_5
                    });
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.deleteDB = deleteDB;
exports.default = {
    idbIsSupported: idbIsSupported,
    CustomDB: CustomDB,
    deleteDB: deleteDB
};
