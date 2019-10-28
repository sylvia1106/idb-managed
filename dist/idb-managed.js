(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["IDBM"] = factory();
	else
		root["IDBM"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/idb/build/esm/chunk.js":
/*!*********************************************!*\
  !*** ./node_modules/idb/build/esm/chunk.js ***!
  \*********************************************/
/*! exports provided: a, b, c, d, e */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return wrap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return addTraps; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return instanceOfAny; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return reverseTransformCache; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return unwrap; });
const instanceOfAny = (object, constructors) => constructors.some(c => object instanceof c);

let idbProxyableTypes;
let cursorAdvanceMethods;
// This is a function to prevent it throwing up in node environments.
function getIdbProxyableTypes() {
    return (idbProxyableTypes ||
        (idbProxyableTypes = [
            IDBDatabase,
            IDBObjectStore,
            IDBIndex,
            IDBCursor,
            IDBTransaction,
        ]));
}
// This is a function to prevent it throwing up in node environments.
function getCursorAdvanceMethods() {
    return (cursorAdvanceMethods ||
        (cursorAdvanceMethods = [
            IDBCursor.prototype.advance,
            IDBCursor.prototype.continue,
            IDBCursor.prototype.continuePrimaryKey,
        ]));
}
const cursorRequestMap = new WeakMap();
const transactionDoneMap = new WeakMap();
const transactionStoreNamesMap = new WeakMap();
const transformCache = new WeakMap();
const reverseTransformCache = new WeakMap();
function promisifyRequest(request) {
    const promise = new Promise((resolve, reject) => {
        const unlisten = () => {
            request.removeEventListener('success', success);
            request.removeEventListener('error', error);
        };
        const success = () => {
            resolve(wrap(request.result));
            unlisten();
        };
        const error = () => {
            reject(request.error);
            unlisten();
        };
        request.addEventListener('success', success);
        request.addEventListener('error', error);
    });
    promise
        .then(value => {
        // Since cursoring reuses the IDBRequest (*sigh*), we cache it for later retrieval
        // (see wrapFunction).
        if (value instanceof IDBCursor) {
            cursorRequestMap.set(value, request);
        }
        // Catching to avoid "Uncaught Promise exceptions"
    })
        .catch(() => { });
    // This mapping exists in reverseTransformCache but doesn't doesn't exist in transformCache. This
    // is because we create many promises from a single IDBRequest.
    reverseTransformCache.set(promise, request);
    return promise;
}
function cacheDonePromiseForTransaction(tx) {
    // Early bail if we've already created a done promise for this transaction.
    if (transactionDoneMap.has(tx))
        return;
    const done = new Promise((resolve, reject) => {
        const unlisten = () => {
            tx.removeEventListener('complete', complete);
            tx.removeEventListener('error', error);
            tx.removeEventListener('abort', error);
        };
        const complete = () => {
            resolve();
            unlisten();
        };
        const error = () => {
            reject(tx.error);
            unlisten();
        };
        tx.addEventListener('complete', complete);
        tx.addEventListener('error', error);
        tx.addEventListener('abort', error);
    });
    // Cache it for later retrieval.
    transactionDoneMap.set(tx, done);
}
let idbProxyTraps = {
    get(target, prop, receiver) {
        if (target instanceof IDBTransaction) {
            // Special handling for transaction.done.
            if (prop === 'done')
                return transactionDoneMap.get(target);
            // Polyfill for objectStoreNames because of Edge.
            if (prop === 'objectStoreNames') {
                return target.objectStoreNames || transactionStoreNamesMap.get(target);
            }
            // Make tx.store return the only store in the transaction, or undefined if there are many.
            if (prop === 'store') {
                return receiver.objectStoreNames[1]
                    ? undefined
                    : receiver.objectStore(receiver.objectStoreNames[0]);
            }
        }
        // Else transform whatever we get back.
        return wrap(target[prop]);
    },
    has(target, prop) {
        if (target instanceof IDBTransaction &&
            (prop === 'done' || prop === 'store')) {
            return true;
        }
        return prop in target;
    },
};
function addTraps(callback) {
    idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
    // Due to expected object equality (which is enforced by the caching in `wrap`), we
    // only create one new func per func.
    // Edge doesn't support objectStoreNames (booo), so we polyfill it here.
    if (func === IDBDatabase.prototype.transaction &&
        !('objectStoreNames' in IDBTransaction.prototype)) {
        return function (storeNames, ...args) {
            const tx = func.call(unwrap(this), storeNames, ...args);
            transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
            return wrap(tx);
        };
    }
    // Cursor methods are special, as the behaviour is a little more different to standard IDB. In
    // IDB, you advance the cursor and wait for a new 'success' on the IDBRequest that gave you the
    // cursor. It's kinda like a promise that can resolve with many values. That doesn't make sense
    // with real promises, so each advance methods returns a new promise for the cursor object, or
    // undefined if the end of the cursor has been reached.
    if (getCursorAdvanceMethods().includes(func)) {
        return function (...args) {
            // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
            // the original object.
            func.apply(unwrap(this), args);
            return wrap(cursorRequestMap.get(this));
        };
    }
    return function (...args) {
        // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
        // the original object.
        return wrap(func.apply(unwrap(this), args));
    };
}
function transformCachableValue(value) {
    if (typeof value === 'function')
        return wrapFunction(value);
    // This doesn't return, it just creates a 'done' promise for the transaction,
    // which is later returned for transaction.done (see idbObjectHandler).
    if (value instanceof IDBTransaction)
        cacheDonePromiseForTransaction(value);
    if (instanceOfAny(value, getIdbProxyableTypes()))
        return new Proxy(value, idbProxyTraps);
    // Return the same value back if we're not going to transform it.
    return value;
}
function wrap(value) {
    // We sometimes generate multiple promises from a single IDBRequest (eg when cursoring), because
    // IDB is weird and a single IDBRequest can yield many responses, so these can't be cached.
    if (value instanceof IDBRequest)
        return promisifyRequest(value);
    // If we've already transformed this value before, reuse the transformed value.
    // This is faster, but it also provides object equality.
    if (transformCache.has(value))
        return transformCache.get(value);
    const newValue = transformCachableValue(value);
    // Not all types are transformed.
    // These may be primitive types, so they can't be WeakMap keys.
    if (newValue !== value) {
        transformCache.set(value, newValue);
        reverseTransformCache.set(newValue, value);
    }
    return newValue;
}
const unwrap = (value) => reverseTransformCache.get(value);




/***/ }),

/***/ "./node_modules/idb/build/esm/index.js":
/*!*********************************************!*\
  !*** ./node_modules/idb/build/esm/index.js ***!
  \*********************************************/
/*! exports provided: unwrap, wrap, openDB, deleteDB */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openDB", function() { return openDB; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deleteDB", function() { return deleteDB; });
/* harmony import */ var _chunk_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chunk.js */ "./node_modules/idb/build/esm/chunk.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "unwrap", function() { return _chunk_js__WEBPACK_IMPORTED_MODULE_0__["e"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "wrap", function() { return _chunk_js__WEBPACK_IMPORTED_MODULE_0__["a"]; });




/**
 * Open a database.
 *
 * @param name Name of the database.
 * @param version Schema version.
 * @param callbacks Additional callbacks.
 */
function openDB(name, version, { blocked, upgrade, blocking } = {}) {
    const request = indexedDB.open(name, version);
    const openPromise = Object(_chunk_js__WEBPACK_IMPORTED_MODULE_0__["a"])(request);
    if (upgrade) {
        request.addEventListener('upgradeneeded', event => {
            upgrade(Object(_chunk_js__WEBPACK_IMPORTED_MODULE_0__["a"])(request.result), event.oldVersion, event.newVersion, Object(_chunk_js__WEBPACK_IMPORTED_MODULE_0__["a"])(request.transaction));
        });
    }
    if (blocked)
        request.addEventListener('blocked', () => blocked());
    if (blocking) {
        openPromise.then(db => db.addEventListener('versionchange', blocking)).catch(() => { });
    }
    return openPromise;
}
/**
 * Delete a database.
 *
 * @param name Name of the database.
 */
function deleteDB(name, { blocked } = {}) {
    const request = indexedDB.deleteDatabase(name);
    if (blocked)
        request.addEventListener('blocked', () => blocked());
    return Object(_chunk_js__WEBPACK_IMPORTED_MODULE_0__["a"])(request).then(() => undefined);
}

const readMethods = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'];
const writeMethods = ['put', 'add', 'delete', 'clear'];
const cachedMethods = new Map();
function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase &&
        !(prop in target) &&
        typeof prop === 'string')) {
        return;
    }
    if (cachedMethods.get(prop))
        return cachedMethods.get(prop);
    const targetFuncName = prop.replace(/FromIndex$/, '');
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods.includes(targetFuncName);
    if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) ||
        !(isWrite || readMethods.includes(targetFuncName))) {
        return;
    }
    const method = async function (storeName, ...args) {
        // isWrite ? 'readwrite' : undefined gzipps better, but fails in Edge :(
        const tx = this.transaction(storeName, isWrite ? 'readwrite' : 'readonly');
        let target = tx.store;
        if (useIndex)
            target = target.index(args.shift());
        const returnVal = target[targetFuncName](...args);
        if (isWrite)
            await tx.done;
        return returnVal;
    };
    cachedMethods.set(prop, method);
    return method;
}
Object(_chunk_js__WEBPACK_IMPORTED_MODULE_0__["b"])(oldTraps => ({
    get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
    has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop),
}));




/***/ }),

/***/ "./src/db_wrapper.ts":
/*!***************************!*\
  !*** ./src/db_wrapper.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

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
var idb_1 = __webpack_require__(/*! idb */ "./node_modules/idb/build/esm/index.js");
var utils_1 = __webpack_require__(/*! ./lib/utils */ "./src/lib/utils.ts");
var formatted_result_1 = __webpack_require__(/*! ./lib/formatted_result */ "./src/lib/formatted_result.ts");
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


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

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
var db_env_checker_1 = __webpack_require__(/*! ./lib/db_env_checker */ "./src/lib/db_env_checker.ts");
var formatted_result_1 = __webpack_require__(/*! ./lib/formatted_result */ "./src/lib/formatted_result.ts");
var db_wrapper_1 = __webpack_require__(/*! ./db_wrapper */ "./src/db_wrapper.ts");
var utils_1 = __webpack_require__(/*! ./lib/utils */ "./src/lib/utils.ts");
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


/***/ }),

/***/ "./src/lib/db_env_checker.ts":
/*!***********************************!*\
  !*** ./src/lib/db_env_checker.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file IndexedDB compatibility checker
 */
var formatted_result_1 = __webpack_require__(/*! ./formatted_result */ "./src/lib/formatted_result.ts");
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


/***/ }),

/***/ "./src/lib/formatted_result.ts":
/*!*************************************!*\
  !*** ./src/lib/formatted_result.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

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


/***/ }),

/***/ "./src/lib/utils.ts":
/*!**************************!*\
  !*** ./src/lib/utils.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
;
exports.ParamCheckerEnum = {
    NonNegativeInteger: {
        rule: isNonNegativeInteger,
        desc: 'needs to be a non-negative integer'
    },
    NotNullObject: {
        rule: function (param) {
            return param && typeof param === 'object';
        },
        desc: 'needs to be a not-null object'
    },
    String: {
        rule: function (param) {
            return typeof param === 'string';
        },
        desc: 'needs to be a string'
    },
    Array: {
        rule: function (param) {
            return param instanceof Array;
        },
        desc: 'needs to be an Array'
    },
    Boolean: {
        rule: function (param) {
            return typeof param === 'boolean';
        },
        desc: 'needs to be a boolean'
    }
};
function isNonNegativeInteger(x) {
    return !isNaN(x) && x >= 0;
}
exports.isNonNegativeInteger = isNonNegativeInteger;
function optionWithBackup(param, backup) {
    return param !== undefined ? param : backup;
}
exports.optionWithBackup = optionWithBackup;
function paramChecker(param, checker, paramName, optional) {
    var exp = paramName + " " + checker.desc;
    if (optional) {
        if (param !== undefined && !checker.rule(param)) {
            throw exp + " if defined";
        }
    }
    else {
        if (!checker.rule(param)) {
            throw "" + exp;
        }
    }
}
exports.paramChecker = paramChecker;
function deduplicateList(list) {
    var deduplicatedList = list.reduce(function (accumulator, currentItem) {
        if (accumulator.indexOf(currentItem) < 0) {
            return accumulator.concat(currentItem);
        }
        else {
            return accumulator;
        }
    }, []);
    return deduplicatedList;
}
exports.deduplicateList = deduplicateList;


/***/ }),

/***/ 0:
/*!****************************!*\
  !*** multi ./src/index.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./src/index.ts */"./src/index.ts");


/***/ })

/******/ });
});
//# sourceMappingURL=idb-managed.js.map