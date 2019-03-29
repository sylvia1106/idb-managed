import idb from './lib/idb'
import dbEnvChecker from './lib/db_env_checker'
import FormatResult from './lib/formatted_result'
const IDB_MANAGER_DB_NAME = 'IDB_MANAGER_DB' // This db manages all dbs that created locally, stores all dbs' info
const IDB_MANAGER_DB_STORE_NAME = 'IDB_MANAGER_STORE'
const IDB_MANAGER_DB_STORE_INDEX_NAME = 'dbName'
const UPDATETIME_KEYNAME = 'updateTime'
const EXPIRETIME_KEYNAME = 'expireTime'

// /**
//  *
//  * @param dbName
//  * @param tableList
//  */
// function _createDB(dbName, tableList) {

// }

/**
 * Check whether db exists.
 * Resolve itemValue of this db in IDB_MANAGER if db exists; resolve null if not or expired.
 * Reject FormatResult if error occurs.
 * @param dbName
 * @resolve itemValue or null
 * @reject FormatResult
 */
function _checkDBExists(dbName) {
  return new Promise((resolve, reject) => {
    idb.open(IDB_MANAGER_DB_NAME, 1, (upgradeDB) => {
      try {
        upgradeDB.createObjectStore(IDB_MANAGER_DB_STORE_NAME, { keyPath: IDB_MANAGER_DB_STORE_INDEX_NAME })
      } catch (e) {
        reject(FormatResult['DB_OPEN_FAIL'].setData({ desc: 'Function .createObjectStore failed when open IDB_MANAGER_DB', err: e }))
      }
    }).then((db) => {
      _getItemFromStore(db, IDB_MANAGER_DB_STORE_NAME, dbName)
        .then((itemValue) => {
          resolve(itemValue)
        })
        .catch((formatResult) => {
          if (formatResult.code === FormatResult['ITEM_NOT_FOUND'].code || formatResult.code === FormatResult['ITEM_EXPIRED'].code) {
            resolve(null)
          } else {
            reject(formatResult)
          }
        })
    }).catch((e) => {
      reject(FormatResult['DB_OPEN_FAIL']).setData({ desc: 'Open IDB_MANAGER_DB failed', err: e })
    })
  })
}


/**
 * Get single item from store with item's primaryKey value.
 * Resolve itemValue if exists and not expired, otherwise reject.
 * @param db
 * @param storeName
 * @param itemKey
 * @resolve itemValue
 * @reject FormatResult
 */
function _getItemFromStore(db, storeName, itemKey) {
  return new Promise((resolve, reject) => {
    try {
      if (db.objectStoreNames.contains(storeName)) {
        let trans = db.transaction(storeName, 'readonly')
        let store = trans.objectStore(storeName)
        store.get(itemKey)
          .then((itemValue) => {
            if (itemValue === undefined) {
              reject(FormatResult('ITEM_NOT_FOUND'))
            } else if (itemValue[EXPIRETIME_KEYNAME] > 0 && itemValue[EXPIRETIME_KEYNAME] < Date.now()) {
              reject(FormatResult('ITEM_EXPIRED'))
            } else {
              resolve(itemValue)
            }
          })
          .catch((e) => {
            reject(FormatResult('GET_ITEM_FAIL').setData({ desc: 'Function .get failed when get item from store', err: e }))
          })
      } else {
        reject(FormatResult('STORE_NOT_FOUND'))
      }
    } catch (e) {
      reject(FormatResult('GET_ITEM_FAIL').setData({ desc: 'Function .objectStoreNames.contains failed when get item from store', err: e }))
    }
  })
}


function _openDB(dbName, version) {

}

function openDB(dbName) {
  return new Promise((resolve, reject) => {
    _checkDBExists(dbName)
      .then((dbItem) => {
        if (dbItem !== null) {
          openDB()
        } else {
          // TODO 
        }
      })
      .catch(reject)
  })
}

function addItems(db, itemList) {

}

function getItem() {

}

function getItemsBetweenRange() {

}

function deleteItems() {

}

const DBWrapper = {
  addItems,
  getItem,
  getItemsBetweenRange,
  deleteItems
}

export default DBWrapper