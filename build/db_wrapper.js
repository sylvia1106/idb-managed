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
var idb_1 = require("idb");
var utils_1 = require("./lib/utils");
var formatted_result_1 = require("./lib/formatted_result");
var IDB_MANAGER_VERSION = 1;
var IDB_MANAGER_DB_NAME = 'IDB_MANAGER_DB';
var IDB_MANAGER_DB_TABLE_NAME = 'IDB_MANAGER_STORE';
var IDB_MANAGER_DB_TABLE_INDEX_NAME = 'dbName';
var UPDATETIME_KEYNAME = 'updateTime';
var EXPIRETIME_KEYNAME = 'expireTime';
function indexRange2DBKey(indexRange) {
    var onlyIndex = indexRange.onlyIndex, lowerIndex = indexRange.lowerIndex, upperIndex = indexRange.upperIndex, _a = indexRange.lowerExclusive, lowerExclusive = _a === void 0 ? false : _a, _b = indexRange.upperExclusive, upperExclusive = _b === void 0 ? false : _b;
    if (onlyIndex !== undefined) {
        return IDBKeyRange.only(onlyIndex);
    }
    else if (lowerIndex !== undefined && upperIndex !== undefined) {
        return IDBKeyRange.bound(lowerIndex, upperIndex, lowerExclusive, upperExclusive);
    }
    else if (lowerIndex !== undefined) {
        return IDBKeyRange.lowerBound(lowerIndex, lowerExclusive);
    }
    else {
        return IDBKeyRange.upperBound(upperIndex, upperExclusive);
    }
}
function itemWrapper(itemConfig) {
    var _a;
    var currentTime = Date.now();
    return __assign(__assign({}, itemConfig.item), (_a = {},
        _a[UPDATETIME_KEYNAME] = currentTime,
        _a[EXPIRETIME_KEYNAME] = itemConfig.itemDuration !== undefined
            ? itemConfig.itemDuration + currentTime
            : -1,
        _a));
}
function itemUnwrapper(item) {
    if (!item) {
        return null;
    }
    else if (item.expireTime > 0 && item.expireTime < Date.now()) {
        return null;
    }
    else {
        delete item.updateTime;
        delete item.expireTime;
        return item;
    }
}
function registerDBInManager(dbInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var dbManager, dbAlreadyInManager, addDBTrans, table, dbItem;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, openDBManager()];
                case 1:
                    dbManager = _a.sent();
                    return [4 /*yield*/, getItemFromDB(dbManager, IDB_MANAGER_DB_TABLE_NAME, dbInfo.name)];
                case 2:
                    dbAlreadyInManager = (_a.sent());
                    if (!(dbAlreadyInManager && dbInfo.version <= dbAlreadyInManager.version)) return [3 /*break*/, 3];
                    // No need to register
                    return [2 /*return*/];
                case 3:
                    addDBTrans = dbManager.transaction(IDB_MANAGER_DB_TABLE_NAME, 'readwrite');
                    table = addDBTrans.objectStore(IDB_MANAGER_DB_TABLE_NAME);
                    dbItem = {
                        dbName: dbInfo.name,
                        tableList: dbInfo.tableList,
                        version: dbInfo.version
                    };
                    table.put(itemWrapper({
                        item: dbItem,
                        tableName: IDB_MANAGER_DB_TABLE_NAME
                    }));
                    return [4 /*yield*/, addDBTrans.done];
                case 4:
                    _a.sent();
                    dbManager.close();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function unregisterDBInManager(dbName) {
    return __awaiter(this, void 0, void 0, function () {
        var dbManager, deleteTrans, table;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, openDBManager()];
                case 1:
                    dbManager = _a.sent();
                    deleteTrans = dbManager.transaction(IDB_MANAGER_DB_TABLE_NAME, 'readwrite');
                    table = deleteTrans.objectStore(IDB_MANAGER_DB_TABLE_NAME);
                    table.delete(dbName);
                    return [4 /*yield*/, deleteTrans.done];
                case 2:
                    _a.sent();
                    dbManager.close();
                    return [2 /*return*/];
            }
        });
    });
}
function createDB(dbInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, registerDBInManager(dbInfo)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, idb_1.openDB(dbInfo.name, dbInfo.version, {
                            upgrade: function (upgradeDB, oldVersion, newVersion, transaction) {
                                upgradeDBWithTableList(upgradeDB, dbInfo.tableList, transaction);
                            }
                        })];
                case 2:
                    db = _a.sent();
                    return [2 /*return*/, db];
            }
        });
    });
}
function openDBManager() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, idb_1.openDB(IDB_MANAGER_DB_NAME, IDB_MANAGER_VERSION, {
                        // In case DB Manager has not been created.
                        upgrade: function (upgradeDB) {
                            upgradeDBManager(upgradeDB);
                        }
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function openDB(dbName) {
    return __awaiter(this, void 0, void 0, function () {
        var dbManager, dbAlreadyInManager, db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, openDBManager()];
                case 1:
                    dbManager = _a.sent();
                    return [4 /*yield*/, getItemFromDB(dbManager, IDB_MANAGER_DB_TABLE_NAME, dbName)];
                case 2:
                    dbAlreadyInManager = (_a.sent());
                    dbManager.close();
                    if (!dbAlreadyInManager) return [3 /*break*/, 4];
                    return [4 /*yield*/, idb_1.openDB(dbAlreadyInManager.dbName, dbAlreadyInManager.version, {
                            // In case this DB has not been created.
                            upgrade: function (upgradeDB, oldVersion, newVersion, transaction) {
                                upgradeDBWithTableList(upgradeDB, dbAlreadyInManager.tableList || [], transaction);
                            }
                        })];
                case 3:
                    db = _a.sent();
                    return [2 /*return*/, db];
                case 4: throw formatted_result_1.default['DB_NOT_FOUND'];
            }
        });
    });
}
function getItemFromDB(db, tableName, primaryKeyValue) {
    return __awaiter(this, void 0, void 0, function () {
        var trans, table, itemInTable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!db.objectStoreNames.contains(tableName)) return [3 /*break*/, 2];
                    trans = db.transaction(tableName, 'readonly');
                    table = trans.objectStore(tableName);
                    return [4 /*yield*/, table.get(primaryKeyValue)];
                case 1:
                    itemInTable = (_a.sent());
                    return [2 /*return*/, itemUnwrapper(itemInTable)];
                case 2: throw formatted_result_1.default['TABLE_NOT_FOUND'];
            }
        });
    });
}
function upgradeDBManager(upgradeDB) {
    upgradeDB.createObjectStore(IDB_MANAGER_DB_TABLE_NAME, {
        keyPath: IDB_MANAGER_DB_TABLE_INDEX_NAME
    });
}
function upgradeDBWithTableList(upgradeDB, tableList, transaction) {
    try {
        tableList.forEach(function (tableConfig) {
            // If table already exists.
            if (upgradeDB.objectStoreNames.contains(tableConfig.tableName)) {
                var currentTable_1 = transaction.objectStore(tableConfig.tableName);
                // Create new index for present table.
                (tableConfig.indexList || []).forEach(function (theIndex) {
                    if (!currentTable_1.indexNames.contains(theIndex.indexName)) {
                        currentTable_1.createIndex(theIndex.indexName, theIndex.indexName, { unique: theIndex.unique });
                    }
                });
                // Else create new table.
            }
            else {
                var tablePrimaryKey = tableConfig.primaryKey || 'id';
                var tableToCreate_1 = upgradeDB.createObjectStore(tableConfig.tableName, __assign({ keyPath: tablePrimaryKey }, (tablePrimaryKey === 'id'
                    ? { autoIncrement: true }
                    : {})));
                // Set index of primaryKey.
                tableToCreate_1.createIndex(tablePrimaryKey, tablePrimaryKey, {
                    unique: true
                });
                // Set indexes defined in tableConfig
                (tableConfig.indexList || []).forEach(function (theIndex) {
                    tableToCreate_1.createIndex(theIndex.indexName, theIndex.indexName, { unique: theIndex.unique });
                });
                // Set index of updateTime for data ordering priority.
                tableToCreate_1.createIndex(UPDATETIME_KEYNAME, UPDATETIME_KEYNAME, { unique: false });
                // Set index of expireTime for expired data deletion.
                tableToCreate_1.createIndex(EXPIRETIME_KEYNAME, EXPIRETIME_KEYNAME, { unique: false });
            }
        });
    }
    catch (e) {
        console.log(e);
        upgradeDB.close(); // Close upgraded DB to trigger the failure of this opening process.
    }
}
function deleteItemsFromDB(db, tableIndexRanges) {
    return __awaiter(this, void 0, void 0, function () {
        var dedupTableNameList, deleteItemsTrans, _i, tableIndexRanges_1, tableIndexRange, tableName, indexRange, table, index, cursor, errMsg_1, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dedupTableNameList = utils_1.deduplicateList(tableIndexRanges.map(function (tableIndexRange) { return tableIndexRange.tableName; }));
                    dedupTableNameList.forEach(function (tableName) {
                        if (!db.objectStoreNames.contains(tableName)) {
                            throw formatted_result_1.default['TABLE_NOT_FOUND'];
                        }
                    });
                    deleteItemsTrans = db.transaction(dedupTableNameList, 'readwrite');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 11, , 16]);
                    _i = 0, tableIndexRanges_1 = tableIndexRanges;
                    _a.label = 2;
                case 2:
                    if (!(_i < tableIndexRanges_1.length)) return [3 /*break*/, 9];
                    tableIndexRange = tableIndexRanges_1[_i];
                    tableName = tableIndexRange.tableName, indexRange = tableIndexRange.indexRange;
                    table = deleteItemsTrans.objectStore(tableName);
                    if (!!indexRange) return [3 /*break*/, 4];
                    return [4 /*yield*/, table.clear()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 4:
                    index = table.index(indexRange.indexName);
                    return [4 /*yield*/, index.openCursor(indexRange2DBKey(indexRange))];
                case 5:
                    cursor = _a.sent();
                    _a.label = 6;
                case 6:
                    if (!cursor) return [3 /*break*/, 8];
                    table.delete(cursor.primaryKey);
                    return [4 /*yield*/, cursor.continue()];
                case 7:
                    cursor = _a.sent();
                    return [3 /*break*/, 6];
                case 8:
                    _i++;
                    return [3 /*break*/, 2];
                case 9: return [4 /*yield*/, deleteItemsTrans.done];
                case 10:
                    _a.sent();
                    db.close();
                    return [3 /*break*/, 16];
                case 11:
                    errMsg_1 = _a.sent();
                    db.close();
                    // Abort transaction manually to keep deleteItems operation atomic.
                    try {
                        deleteItemsTrans.abort();
                    }
                    catch (e) {
                        // Do nothing if transaction abort failed.
                    }
                    _a.label = 12;
                case 12:
                    _a.trys.push([12, 14, , 15]);
                    // Catch the Promise error caused by transaction abortion
                    return [4 /*yield*/, deleteItemsTrans.done];
                case 13:
                    // Catch the Promise error caused by transaction abortion
                    _a.sent();
                    return [3 /*break*/, 15];
                case 14:
                    e_1 = _a.sent();
                    throw errMsg_1;
                case 15: return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    });
}
function addItems(customDB, items) {
    return __awaiter(this, void 0, void 0, function () {
        var db, dedupTableNameList, addItemsTrans, errMsg_2, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createDB(customDB)];
                case 1:
                    db = _a.sent();
                    dedupTableNameList = utils_1.deduplicateList(items.map(function (item) { return item.tableName; }));
                    addItemsTrans = db.transaction(dedupTableNameList, 'readwrite');
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 9]);
                    items.forEach(function (item) {
                        var table = addItemsTrans.objectStore(item.tableName);
                        table.put(itemWrapper(item));
                    });
                    return [4 /*yield*/, addItemsTrans.done];
                case 3:
                    _a.sent();
                    db.close();
                    return [3 /*break*/, 9];
                case 4:
                    errMsg_2 = _a.sent();
                    db.close();
                    // Abort transaction manually to keep addItems operation atomic.
                    try {
                        addItemsTrans.abort();
                    }
                    catch (e) {
                        // Do nothing if transaction abort failed.
                    }
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    // Catch the Promise error caused by transaction abortion.
                    return [4 /*yield*/, addItemsTrans.done];
                case 6:
                    // Catch the Promise error caused by transaction abortion.
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    e_2 = _a.sent();
                    throw errMsg_2;
                case 8: return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.addItems = addItems;
function getItem(dbName, tableName, primaryKeyValue) {
    return __awaiter(this, void 0, void 0, function () {
        var db, item, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, openDB(dbName)];
                case 1:
                    db = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, getItemFromDB(db, tableName, primaryKeyValue)];
                case 3:
                    item = _a.sent();
                    db.close();
                    return [2 /*return*/, item];
                case 4:
                    e_3 = _a.sent();
                    db.close();
                    throw e_3;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getItem = getItem;
function getItemsInRange(dbName, tableIndexRange) {
    return __awaiter(this, void 0, void 0, function () {
        var tableName, indexRange, db, trans, table, items, wrappedItems, index, cursor, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tableName = tableIndexRange.tableName, indexRange = tableIndexRange.indexRange;
                    return [4 /*yield*/, openDB(dbName)];
                case 1:
                    db = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 9, , 10]);
                    if (!db.objectStoreNames.contains(tableName)) {
                        throw formatted_result_1.default['TABLE_NOT_FOUND'];
                    }
                    trans = db.transaction(tableName, 'readonly');
                    table = trans.objectStore(tableName);
                    items = [];
                    if (!!indexRange) return [3 /*break*/, 4];
                    return [4 /*yield*/, table.getAll()];
                case 3:
                    wrappedItems = _a.sent();
                    items = (wrappedItems || []).map(itemUnwrapper);
                    return [3 /*break*/, 8];
                case 4:
                    index = table.index(indexRange.indexName);
                    return [4 /*yield*/, index.openCursor(indexRange2DBKey(indexRange))];
                case 5:
                    cursor = _a.sent();
                    _a.label = 6;
                case 6:
                    if (!cursor) return [3 /*break*/, 8];
                    items.push(itemUnwrapper(cursor.value));
                    return [4 /*yield*/, cursor.continue()];
                case 7:
                    cursor = _a.sent();
                    return [3 /*break*/, 6];
                case 8:
                    db.close();
                    return [2 /*return*/, items];
                case 9:
                    e_4 = _a.sent();
                    db.close();
                    throw e_4;
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.getItemsInRange = getItemsInRange;
function deleteDB(dbName) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, unregisterDBInManager(dbName)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, idb_1.deleteDB(dbName)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteDB = deleteDB;
function deleteItems(dbName, tableIndexRanges) {
    return __awaiter(this, void 0, void 0, function () {
        var db, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, openDB(dbName)];
                case 1:
                    db = _a.sent();
                    return [4 /*yield*/, deleteItemsFromDB(db, tableIndexRanges)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_5 = _a.sent();
                    if (e_5.msg === formatted_result_1.default.DB_NOT_FOUND.msg || e_5.msg === formatted_result_1.default.TABLE_NOT_FOUND.msg) {
                        // If db or table does not exist, no need to deleteItems at all.
                        return [2 /*return*/];
                    }
                    else {
                        throw e_5;
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.deleteItems = deleteItems;
exports.default = {
    addItems: addItems,
    getItem: getItem,
    getItemsInRange: getItemsInRange,
    deleteDB: deleteDB,
    deleteItems: deleteItems
};
