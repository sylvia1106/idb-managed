import dbWrapper from './db_wrapper'
import dbEnvChecker from './lib/db_env_checker'
import idb from '../build/js/lib/idb'
import FormatResult from './lib/formatted_result'
const DB_DOCS_URL = 'https://sylvia1106.github.io/idb-managed/'
const SINGLE_DATA_DB_NAME = 'SINGLE_DATA_DB'
const SINGLE_DATA_STORE_NAME = 'SINGLE_DATA_STORE'
const SINGLE_DATA_PRIMARY_KEYNAME = 'keyName'
const SINGLE_DATA_VALUENAME = 'value'

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
 * @param {string} keyName - Item's key.
 * @param {object | string | number | boolean} value - Item's value.
 * @param {integer} [expiredTime] - The expired time of this item data in format of timestamp in miliseconds. Default value is 7 days after when this method is called.
 * @returns {Promise} Resolve FormatResult['SUCC'] if set successfully, otherwise resolve FormatResult with failed msg.
 */
export function setKV(keyName, value, expiredTime) {
}

/**
 * Get one KV item from DB.
 * @todo 
 * @param {string} keyName - Stored item's key.
 * @returns {Promise} Resolve FormatResult['SUCC'] with KV item in data, resolve FormatResult with failed msg if anything wrong happened.
 */
export function getKV(keyName) {
}

/**
 * Get one item from specific DB.
 * @todo 
 * @param dbName 
 * @param storeName 
 * @param itemKey 
 */
export function getItemFromDB(dbName, storeName, itemKey) {

}

/**
 * Get Items from DB within an index range.
 * @param dbName
 * @param storeName
 * @param {Object} [rangeOb] - Index range. All items in the store will be resolved if rangeOb is undefined.
 * @param {string} rangeOb.indexName - Name of the index. It is required if rangeOb is not undefined.
 * @param {string} [rangeOb.lowerValue] - LowerValue of range.
 * @param {string} [rangeOb.upperValue] - UpperValue of range.
 * @param {boolean} [rangeOb.lowerExclusive = false] - LowerValue is exclusive in range.
 * @param {boolean} [rangeOb.upperExclusive = false] - UpperValue is exclusive in range.
 */
export function getItemsInRangeFromDB(dbName, storeName, rangeOb) {

}

export class CustomDB {
  constructor(dbConfig) {
    if (!dbConfig) {
      throw new Error(`dbConfig is required to construct a customDB, see details: ${DB_DOCS_URL}`)
    }
    if (!dbConfig.dbName) {
      throw new Error('dbName is required for dbConfig to construct a customDB')
    }
    if (!(dbConfig.storeList instanceof Array)) {
      throw new Error('storeList is required and needs to be an Array for dbConfig')
    }
    this.dbName = dbConfig.dbName
    this.storeList = dbConfig.storeList
    this.dbVersion = dbConfig.dbVersion || undefined
  }
  // itemList: [{storeName, item, expireTime}...]
  addItems(itemList) {
    return new Promise((resolve, reject) => {
      // TODO check itemList valid
      dbWrapper.openDB(this.dbName, this.storeList, this.dbVersion)
        .then((db) => {
          return dbWrapper.deleteExpiredItems(db, itemList.map(item => item.storeName))
        })
        .then((db) => {
          return dbWrapper.addItems(db, itemList)
        })
        .then((db) => {
          resolve(FormatResult['SUCC'])
          db.close()
        })
        .catch(reject)
    })
  }

  getItem(storeName, itemKey) {
    return new Promise((resolve, reject) => {

    })
  }
}

export function deleteDB() {

}

const IDBManaged = {
  idbIsSupported
}

export default IDBManaged