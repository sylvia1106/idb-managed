import dbWrapper from './db_wrapper'
import dbEnvChecker from './lib/db_env_checker'
import FormatResult from './lib/formatted_result'
const DB_DOCS_URL = 'https://sylvia1106.github.io/idb-managed/'
const SINGLE_DATA_DB_NAME = 'SINGLE_DATA_DB'
const SINGLE_DATA_STORE_NAME = 'SINGLE_DATA_STORE'
const SINGLE_DATA_PRIMARY_KEYNAME = 'keyName'
const SINGLE_DATA_VALUENAME = 'value'
const DEFAULT_EXPIRE_MILISECONDS = 7 * 24 * 3600 * 1000

/**
 * Throws errorMsg if config not valid.
 */
function _customDBConfigChecker(dbConfig) {
  if (!dbConfig) {
    throw `dbConfig is required, see details: ${DB_DOCS_URL}`
  }
  if (!dbConfig.dbName) {
    throw 'dbName is required'
  }
  if (!(dbConfig.storeList instanceof Array)) {
    throw 'storeList needs to be an Array'
  }
  dbConfig.storeList.forEach(store => {
    if (typeof store.storeName !== 'string' || !store.storeName) {
      throw 'storeName needs to be a string'
    }
    if (store.primaryKey && typeof store.primaryKey !== 'string') {
      throw 'primaryKey needs to be a string if not undefined'
    }
    if (store.indexList) {
      if (!(store.indexList instanceof Array)) {
        throw 'indexList needs to be an Array if not undefined'
      } else {
        store.indexList.forEach(index => {
          if (typeof index.indexName !== 'string' || !index.indexName) {
            throw 'indexName needs to be a string'
          }
        })
      }
    }
  })
  if (dbConfig.dbVersion) {
    if (isNaN(parseInt(dbConfig.dbVersion)) || parseInt(dbConfig.dbVersion) < 0) {
      throw 'dbVersion needs to be a non-negative integer if not undefined'
    }
  }
}

function _customDBAddItemsParamChecker(itemList) {
  if (!(itemList instanceof Array)) {
    throw 'itemList needs to be an Array'
  }
  itemList.forEach(item => {
    if (!item.storeName) {
      throw 'storeName is required'
    }
    if (item.expireTime !== undefined && (isNaN(parseInt(item.expireTime)) || item.expireTime < 0 || isNaN(new Date(item.expireTime).getTime()))) {
      throw 'expireTime needs to be a non-negative integer and also a valid timestamp if not undefined'
    }
  })
}

function _getInRangeParamChecker(rangeOb) {
  if (rangeOb) {
    if (typeof rangeOb !== 'object') {
      throw 'rangeOb needs to be an object if not undefined'
    }
    if (typeof rangeOb.indexName !== 'string' || !rangeOb.indexName) {
      throw 'indexName needs to be a string'
    }
  }
}

/**
 * @returns {boolean} IndexedDB is supported or not.
 */
export function idbIsSupported() {
  if (dbEnvChecker.getResult().code !== FormatResult['SUCC'].code) {
    return false
  } else {
    return true
  }
}

/**
 * Store one KV item into DB.
 * @todo
 * @async
 * @param {string} key - Item's key.
 * @param {(Object | string | number | boolean)} value - Item's value.
 * @param {timestamp} [expireTime] - The expired time of this item data in format of timestamp in miliseconds. Default value is 7 days after when this method is called.
 * @returns {Promise<FormatResult>} Resolve FormatResult['SUCC'] if set successfully, otherwise resolve FormatResult with failed msg.
 */
export function setKV(key, value, expireTime) {
  let item = {}
  item[SINGLE_DATA_PRIMARY_KEYNAME] = key
  item[SINGLE_DATA_VALUENAME] = value
  return dbWrapper.addItems(SINGLE_DATA_DB_NAME, [{
    tableName: SINGLE_DATA_STORE_NAME,
    primaryKey: SINGLE_DATA_PRIMARY_KEYNAME,
    indexList: []
  }], 1, [{
    storeName: SINGLE_DATA_STORE_NAME,
    item: item,
    expireTime: expireTime
  }])
}

/**
 * Get one KV item from DB.
 * @todo
 * @async
 * @param {string} key - Stored item's key.
 * @returns {Promise<FormatResult>} Resolve FormatResult['SUCC'] with item in data, resolve FormatResult with failed msg if anything wrong happened.
 */
export function getKV(key) {
}

/**
 * Get one item from specific DB.
 * @todo
 * @async
 * @param {string} dbName - DB's name.
 * @param {string} storeName - Store's name.
 * @param {string} primaryKeyValue - Primarykey value of this item.
 * @returns {Promise<FormatResult>} Resolve FormatResult['SUCC'] with item in data, resolve FormatResult with failed mag if anything wrong happened.
 */
export function getItemFromDB(dbName, storeName, primaryKeyValue) {

}

/**
 * Get Items from DB within an index range.
 * @todo
 * @async
 * @param dbName - DB's name.
 * @param storeName - Store's name.
 * @param {Object} [rangeOb] - Index range. All items in the store will be resolved if rangeOb is undefined.
 * @param {string} rangeOb.indexName - Name of the index. It is required if rangeOb is not undefined.
 * @param {string} [rangeOb.lowerValue] - LowerValue of range.
 * @param {string} [rangeOb.upperValue] - UpperValue of range.
 * @param {boolean} [rangeOb.lowerExclusive = false] - LowerValue is exclusive in range.
 * @param {boolean} [rangeOb.upperExclusive = false] - UpperValue is exclusive in range.
 * @returns {Promise<FormatResult>} Resolve FormatResult['SUCC'] with itemArray in data, resolve FormatResult with failed mag if anything wrong happened.
 */
export function getItemsInRangeFromDB(dbName, storeName, rangeOb) {
  try {
    _getInRangeParamChecker(rangeOb)
  } catch (errorMsg) {
    return Promise.resolve(FormatResult['PARAM_INVALID'].setData({desc: `Get items in range from DB failed: ${errorMsg}.`}))
  }
}

/**
 * @todo
 * @async
 * @param {string} dbName
 * @returns {Promise<FormatResult>} Resolve FormatResult['SUCC'] if deleted successfully, otherwise resolve FormatResult with failed msg.
 */
export function deleteDB(dbName) {
  return dbWrapper.deleteDB(dbName)
}

export class CustomDB {
  /**
   * @param {Object} dbConfig - Configs to construct this CustomDB.
   * @param {string} dbConfig.dbName - DB's name.
   * @param {Object[]} dbConfig.storeList - DB's store list.
   * @param {string} dbConfig.storeList[].storeName - This store's name.
   * @param {string} [dbConfig.storeList[].primaryKey = id] - Primarykey of each item in this store. 'id' as default.
   * @param {Object[]} [dbConfig.storeList[].indexList] - Index list of this store.
   * @param {string} dbConfig.storeList[].indexList[].indexName - This index's name.
   * @param {boolean} [dbConfig.storeList[].indexList[].unique = false] - This index's uniqueness. false as default.
   * @param {non-negative integer} [dbConfig.dbVersion = 1] - DB's version. 1 as default. If dbVersion is no bigger than current DB's version in the browser, idb-managed will use current DB's config and ignore this dbConfig.
   */
  constructor(dbConfig) {
    try {
      _customDBConfigChecker(dbConfig)
    } catch (errorMsg) {
      throw new Error(`Construct a CustomDB failed: ${errorMsg}.`)
    }
    this.dbName = dbConfig.dbName
    this.storeList = dbConfig.storeList
    this.dbVersion = dbConfig.dbVersion || 1
  }
  /**
   * @todo
   * @async
   * @param {Object[]} itemList - Items to be added into the CustomDB.
   * @param {string} itemList[].storeName - Store's name.
   * @param {Object} itemList[].item - Item's value.
   * @param {timestamp} [itemList[].expireTime] - The expired time of this item data in format of timestamp in miliseconds. Default value is 7 days when this method is called.
   * @returns {Promise<FormatResult>} Resolve FormatResult['SUCC'] if add successfully, otherwise resolve FormatResult with failed msg.
   */
  addItems(itemList) {
    try {
      _customDBAddItemsParamChecker(itemList)
    } catch (errorMsg) {
      return Promise.resolve(FormatResult['PARAM_INVALID'].setData({desc: `Add items failed: ${errorMsg}.`}))
    }
    // Set default expireTime
    itemList.forEach((item) => {
      if (item.expireTime === undefined || item.expireTime === null) {
        item.expireTime = Date.now() + DEFAULT_EXPIRE_MILISECONDS
      }
    })
    return dbWrapper.addItems(this.dbName, this.storeList, this.dbVersion, itemList)
  }

  /**
   * Get the item which primaryKey equals primaryKeyValue.
   * @todo
   * @async
   * @param {string} storeName - Store's name.
   * @param {string} primaryKeyValue - Value of the item's primarykey.
   * @returns {Promise<FormatResult>} Resolve FormatResult['SUCC'] with item in data, resolve FormatResult with failed mag if anything wrong happened.
   */
  getItem(storeName, primaryKeyValue) {
  }

  /**
   * Get Items from DB within an index range.
   * @todo
   * @async
   * @param storeName - Store's name.
   * @param {Object} [rangeOb] - Index range. All items in the store will be resolved if rangeOb is undefined.
   * @param {string} rangeOb.indexName - Name of the index. It is required if rangeOb is not undefined.
   * @param {string} [rangeOb.lowerValue] - LowerValue of range.
   * @param {string} [rangeOb.upperValue] - UpperValue of range.
   * @param {boolean} [rangeOb.lowerExclusive = false] - LowerValue is exclusive in range.
   * @param {boolean} [rangeOb.upperExclusive = false] - UpperValue is exclusive in range.
   * @returns {Promise<FormatResult>} Resolve FormatResult['SUCC'] with itemArray in data, resolve FormatResult with failed mag if anything wrong happened.
   */
  getItemsInRange(storeName, rangeOb) {
    return new Promise((resolve) => {
      try {
        _getInRangeParamChecker(rangeOb)
      } catch (errorMsg) {
        resolve(FormatResult['PARAM_INVALID'].setData({desc: `Get items in range failed: ${errorMsg}.`}))
      }
    })
  }
}


export const IDBManaged = {
  idbIsSupported,
  setKV,
  getKV,
  getItemFromDB,
  getItemsInRangeFromDB,
  deleteDB,
  CustomDB
}

export default IDBManaged