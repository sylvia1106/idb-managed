import idb from './lib/idb'
import dbEnvChecker from './lib/db_env_checker'
import FormatResult from './lib/formatted_result'
import { format } from 'url'
const IDB_MANAGER_DB_NAME = 'IDB_MANAGER_DB' // This db manages all dbs that created locally, stores all dbs' info
const IDB_MANAGER_DB_STORE_NAME = 'IDB_MANAGER_STORE'
const IDB_MANAGER_DB_STORE_ITEM_PROPERTY_NAMES = {
  'primaryKey': 'dbName',
  'storeList': 'tableList',
  'dbVersion': 'version'
}
const UPDATETIME_KEYNAME = 'updateTime'
const EXPIRETIME_KEYNAME = 'expireTime'

function __deduplicateList(list) {
  let deduplicatedList = list.reduce((accumulator, currentItem) => {
    if (accumulator.indexOf(currentItem) < 0) {
      return accumulator.concat(currentItem)
    } else {
      return accumulator
    }
  }, [])
  return deduplicatedList
}
/**
 * @param upgradeDB - The upgraded DB when upgradeneeded event fired by idb.open.
 * @param {Object[]} storeList - Stores need to be created when the DB is opening.
 */
function _upgradeDBWithStoreList(upgradeDB, storeList) {
  try {
    storeList.map((store) => {
      // Store already exists.
      if (upgradeDB.objectStoreNames.contains(store.storeName)) {
        let storePresent = upgradeDB.transaction.objectStore(store.storeName)
        store.indexList.map((index) => {
          if (!storePresent.indexNames.contains(index.indexName)) {
            storePresent.createIndex(index.indexName, index.indexName, { unique: Boolean(index.unique) })
          }
        })
      } else {
        let storeToCreate
        // Create store and create index for primaryKey.
        if (store.primaryKey) {
          storeToCreate = upgradeDB.createObjectStore(store.storeName, { keyPath: store.primaryKey })
          storeToCreate.createIndex(store.primaryKey, store.primaryKey, { unique: true })
        } else {
          storeToCreate = upgradeDB.createObjectStore(store.storeName, { keyPath: 'id', autoIncrement: true })
          storeToCreate.createIndex('id', 'id', { unique: true })
        }
        // Create indexes that are defined in storeList.
        store.indexList.map((index) => {
          storeToCreate.createIndex(index.indexName, index.indexName, { unique: Boolean(index.unique) })
        })
        // Create index for expireTime for later expired data deletion.
        storeToCreate.createIndex(EXPIRETIME_KEYNAME, EXPIRETIME_KEYNAME, { unique: false })
        // Create index for updateTime for later ordering data priority.
        storeToCreate.createIndex(UPDATETIME_KEYNAME, UPDATETIME_KEYNAME, { unique: false })
      }
    })
  } catch (e) {
    upgradeDB.close() // Close upgraded DB to trigger the failure of this opening process.
  }
}

function _upgradeIDBManagerDB(upgradeDB) {
  _upgradeDBWithStoreList(upgradeDB, [{storeName: IDB_MANAGER_DB_STORE_NAME, primaryKey: IDB_MANAGER_DB_STORE_ITEM_PROPERTY_NAMES['primaryKey']}])
}

/**
 * @async
 * @param dbName
 * @returns {Promise<FormatResult>} Resolve FormatResult['SUCC'] with dbInfo in data if this DB is registered in IDB_MANAGER; resolve FormatResult with failed msg if DB does not exist or error happens.
 */
function _getDBInfo(dbName) {
  return idb.open(IDB_MANAGER_DB_NAME, 1, (upgradeDB) => {
    _upgradeIDBManagerDB(upgradeDB)
  })
    .then((db) => {
      return _getItemFromStore(db, IDB_MANAGER_DB_STORE_NAME, dbName)
        .then((formatResult) => {
          db.close() // Close db after using.
          return formatResult
        })
    })
    .then((formatResult) => {
      if (formatResult.code === FormatResult['SUCC'].code) {
        return FormatResult['SUCC'].setData({ dbInfo: formatResult.data.itemValue })
      } else if (formatResult.code === FormatResult['ITEM_NOT_FOUND'].code || formatResult.code === FormatResult['ITEM_EXPIRED'].code) {
        return FormatResult['DB_NOT_FOUND']
      } else {
        return formatResult
      }
    })
    .catch((e) => {
      return FormatResult['OPEN_DB_FAIL'].setData({ desc: 'Open IDB_MANAGER_DB failed', err: e })
    })
}

/**
 * Add this DB item into IDB_MANAGER
 * @param dbName - Name of the DB to be added.
 * @param storeList - StoreList of the DB, will be updated if needed.
 * @param dbVersion - Version of the DB, will be updated if it is higher than the present version exists in IDB_MANAGER.
 * @returns {Promise<FormatResult>} Resolve FormatResult['SUCC'] if register successfully, otherwise resolve FormatResult with failed msg.
 */
function _registerDBToManager(dbName, storeList, dbVersion) {
  return idb.open(IDB_MANAGER_DB_NAME, 1, (upgradeDB) => {
    _upgradeIDBManagerDB(upgradeDB)
  })
    .then((db) => {
      return _getItemFromStore(db, IDB_MANAGER_DB_STORE_NAME, dbName)
        .then((formatResult) => {
          return {db, formatResult}
        })
    })
    .then(({db, formatResult}) => {
      if (formatResult.code === FormatResult['SUCC'].code) {
        let dbInfo = formatResult.data.dbInfo
        let storeListPresent = dbInfo[IDB_MANAGER_DB_STORE_ITEM_PROPERTY_NAMES['storeList']]
        let dbVersionPresent = dbInfo[IDB_MANAGER_DB_STORE_ITEM_PROPERTY_NAMES['dbVersion']]
        if (dbVersion > dbVersionPresent) {
          // update dbVersion and storeList
          let trans = db.transaction(IDB_MANAGER_DB_STORE_NAME, 'readwrite')
          let store = trans.objectStore(storeName)
        } else {
          // todo 
        }
      } else if (formatResult.code === FormatResult['ITEM_NOT_FOUND'].code || formatResult.code === FormatResult['ITEM_EXPIRED'].code) {

      } else {
        resolve(formatResult)
      }
    })
}

/**
 * Delete this DB item in IDB_MANAGER
 * @async
 * @param dbName Name of the DB to be deleted
 * @returns FormatResult['SUCC'] if delete successfully, otherwise FormatResult with failed msg.
 */
function _cancelDBFromManager(dbName) {
  return idb.open(IDB_MANAGER_DB_NAME, 1, (upgradeDB) => {
    _upgradeIDBManagerDB(upgradeDB)
  })
    .then((db) => {
      let trans = db.transaction(IDB_MANAGER_DB_STORE_NAME, 'readwrite')
      let store = trans.objectStore(IDB_MANAGER_DB_STORE_NAME)
      store.delete(dbName)
      return trans.complete
    })
    .then(() => {
      return FormatResult['SUCC']
    })
    .catch((e) => {
      return FormatResult['DELETE_DB_FAIL'].setData({desc: 'Cancel DB from DB Manager failed.', err: e})
    })
}

/**
 * Get single item from store with item's primaryKey value.
 * @async
 * @param db
 * @param storeName
 * @param primaryKeyValue
 * @return {Promise<FormatResult>} Resolve FormatResult['SUCC'] with itemValue in data if item exists and not expired, otherwise resolve FormatResult with failed msg.
 */
function _getItemFromStore(db, storeName, primaryKeyValue) {
  if (db.objectStoreNames.contains(storeName)) {
    let trans = db.transaction(storeName, 'readonly')
    let store = trans.objectStore(storeName)
    return store.get(primaryKeyValue)
      .then((itemValue) => {
        if (itemValue === undefined) {
          return FormatResult['ITEM_NOT_FOUND']
        } else if (itemValue[EXPIRETIME_KEYNAME] > 0 && itemValue[EXPIRETIME_KEYNAME] < Date.now()) {
          return FormatResult['ITEM_EXPIRED']
        } else {
          return FormatResult['SUCC'].setData({itemValue})
        }
      })
      .catch((e) => {
        return FormatResult['GET_ITEM_FAIL'].setData({ desc: 'Function .get failed when get item from store', err: e })
      })
  } else {
    return FormatResult['STORE_NOT_FOUND']
  }
}

/**
 * Put items in a transaction, it can roll back if any addition failed in the process.
 * @param db
 * @param itemList
 */
function _putItemsToStores(db, itemList) {
  return new Promise((resolve) => {
    let storeNames = __deduplicateList(itemList.map(item => item.storeName))
    storeNames.forEach((storeName) => {
      if (!db.objectStoreNames.contains(storeName)) {
        resolve(FormatResult['STORE_NOT_FOUND']) // Resolve early if store does not exist.
      }
    })
    let trans = db.transaction(storeNames, 'readwrite')
    itemList.forEach((item) => {
      let store = trans.objectStore(item.storeName)
      let wrappedItem = Object.assign({}, item, Object.defineProperty({}, UPDATETIME_KEYNAME, {value: Date.now()}))
      store.put(wrappedItem)
        .catch((e) => {
          try {
            trans.abort() // Transaction rolls back.
          } catch (e) {
            // Noop, only to catch all the errors because of the transaction abortion.
          }
        })
    })
    trans
    if (db.objectStoreNames.contains(storeName)) {
      let store = trans.objectStore(storeName)
      store.put(wrappedItem)

    } else {
      resolve(FormatResult['STORE_NOT_FOUND'])
    }
  })
}


/**
 * Register DB to IDB_MANAGER before open it.
 * @param dbName
 * @param storeList
 * @param dbVersion
 * @returns {Promise<FormatResult>} Resolve FormatResult['SUCC'] with db in data, otherwise resolve FormatResult with failed msg.
 */
function openDBWithCreation(dbName, storeList, dbVersion) {
  return new Promise((resolve) => {
    _getDBInfo(dbName)
      .then((formatResult) => {
        if (formatResult.code === FormatResult['SUCC'].code) {
          let dbInfo = formatResult.data.dbInfo
          let storeListPresent = dbInfo[IDB_MANAGER_DB_STORE_ITEM_PROPERTY_NAMES['storeList']]
          let dbVersionPresent = dbInfo[IDB_MANAGER_DB_STORE_ITEM_PROPERTY_NAMES['dbVersion']]
          if (dbVersion > dbVersionPresent) {
            return { registerToManager: true, storeList: storeList, dbVersion: dbVersion }
          } else {
            return { registerToManager: false, storeList: storeListPresent, dbVersion: dbVersionPresent }
          }
        } else if (formatResult.code === FormatResult['DB_NOT_FOUND'].code) {
          return { registerToManager: true, storeList: storeList, dbVersion: dbVersion }
        } else {
          resolve(formatResult)
        }
      })
      .then(({registerToManager, storeList, dbVersion}) => {
        if (registerToManager) {
          return _registerDBToManager(dbName, storeList, dbVersion)
            .then((formatResult) => {
              if (formatResult.code === FormatResult['SUCC'].code) {
                return {storeList, dbVersion}
              } else {
                resolve(formatResult)
              }
            })
        } else {
          return {storeList, dbVersion}
        }
      })
      .then(({storeList, dbVersion}) => {
        return idb.open(dbName, dbVersion, (upgradeDB) => {
          _upgradeDBWithStoreList(upgradeDB, storeList)
        })
      })
      .then((db) => {
        resolve(FormatResult['SUCC'].setData({db}))
      })
      .catch((e) => {
        resolve(FormatResult['OPEN_DB_FAIL'].setData({ desc:'Open DB with creation failed.', err: e }))
      })
  })
}

/**
 * Open DB only, and will not create a new DB if it does not exist.
 * @async
 * @param dbName
 * @returns {Promise<FormatResult>} Resolve FormatResult['SUCC'] with db in data, otherwise resolve FormatResult with failed msg.
 */
function openDBWithoutCreation(dbName) {
  return _getDBInfo(dbName)
    .then((formatResult) => {
      if (formatResult.code === FormatResult['SUCC'].code) {
        let dbInfo = formatResult.data.dbInfo
        let dbName = dbInfo[IDB_MANAGER_DB_STORE_ITEM_PROPERTY_NAMES['primaryKey']]
        let storeList = dbInfo[IDB_MANAGER_DB_STORE_ITEM_PROPERTY_NAMES['storeList']]
        let dbVersion = dbInfo[IDB_MANAGER_DB_STORE_ITEM_PROPERTY_NAMES['dbVersion']]
        return idb.open(dbName, dbVersion, (upgradeDB) => {
          // Upgrade DB in case DB is deleted manually, althrough it was registered in IDB_MANAGER.
          _upgradeDBWithStoreList(upgradeDB, storeList)
        })
      } else {
        return formatResult // Resolve early if get DB info failed.
      }
    })
    .then((db) => {
      return FormatResult['SUCC'].setData({db})
    })
    .catch((e) => {
      return FormatResult['OPEN_DB_FAIL'].setData({ desc: 'Open DB without creation failed.', err: e })
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

function deleteDB(dbName) {
}

const DBWrapper = {
  addItems,
  getItem,
  getItemsBetweenRange,
  deleteItems
}

export default DBWrapper