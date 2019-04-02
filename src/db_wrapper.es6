import idb from './lib/idb'
import dbEnvChecker from './lib/db_env_checker'
import FormatResult from './lib/formatted_result'
const IDB_MANAGER_DB_NAME = 'IDB_MANAGER_DB' // This db manages all dbs that created locally, stores all dbs' info
const IDB_MANAGER_DB_STORE_NAME = 'IDB_MANAGER_STORE'
const IDB_MANAGER_DB_STORE_ITEM_PROPERTY_NAMES = {
  'primaryKey': 'dbName',
  'storeList': 'tableList',
  'dbVersion': 'version'
}
const UPDATETIME_KEYNAME = 'updateTime'
const EXPIRETIME_KEYNAME = 'expireTime'

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
 * @param dbName
 * @returns {Promise<FormatResult>} Resolve FormatResult['SUCC'] with dbInfo in data if this DB is registered in IDB_MANAGER; resolve FormatResult with failed msg if DB does not exist or error happens.
 */
function _getDBInfo(dbName) {
  return new Promise((resolve) => {
    idb.open(IDB_MANAGER_DB_NAME, 1, (upgradeDB) => {
      _upgradeIDBManagerDB(upgradeDB)
    })
      .then((db) => {
        return _getItemFromStore(db, IDB_MANAGER_DB_STORE_NAME, dbName)
      })
      .then((formatResult) => {
        if (formatResult.code === FormatResult['SUCC'].code) {
          resolve(FormatResult['SUCC'].setData({ dbInfo: formatResult.data.itemValue }))
        } else if (formatResult.code === FormatResult['ITEM_NOT_FOUND'].code || formatResult.code === FormatResult['ITEM_EXPIRED'].code) {
          resolve(FormatResult['DB_NOT_FOUND'])
        } else {
          resolve(formatResult)
        }
      })
      .catch((e) => {
        resolve(FormatResult['OPEN_DB_FAIL']).setData({ desc: 'Open IDB_MANAGER_DB failed', err: e })
      })
  })
}

// todo 
function _registerDBToManager(dbName, storeList, dbVersion) {

}

// todo 
function _cancelDBFromManager(dbName) {
  return new Promise((resolve, reject) => {
    idb.open(IDB_MANAGER_DB_NAME, 1, (upgradeDB) => {
      _upgradeIDBManagerDB(upgradeDB)
    })
      .then((db) => {
        let trans = db.transaction(IDB_MANAGER_DB_STORE_NAME, 'readwrite')
      })
      .catch((e) => {

      })
  })
}

/**
 * Get single item from store with item's primaryKey value.
 * @param db
 * @param storeName
 * @param primaryKeyValue
 * @return {Promise<FormatResult>} Resolve FormatResult['SUCC'] with itemValue in data if item exists and not expired, otherwise resolve FormatResult with failed msg.
 */
function _getItemFromStore(db, storeName, primaryKeyValue) {
  return new Promise((resolve) => {
    try {
      if (db.objectStoreNames.contains(storeName)) {
        let trans = db.transaction(storeName, 'readonly')
        let store = trans.objectStore(storeName)
        store.get(primaryKeyValue)
          .then((itemValue) => {
            if (itemValue === undefined) {
              resolve(FormatResult['ITEM_NOT_FOUND'])
            } else if (itemValue[EXPIRETIME_KEYNAME] > 0 && itemValue[EXPIRETIME_KEYNAME] < Date.now()) {
              resolve(FormatResult['ITEM_EXPIRED'])
            } else {
              resolve(FormatResult['SUCC'].setData({itemValue}))
            }
          })
          .catch((e) => {
            resolve(FormatResult['GET_ITEM_FAIL'].setData({ desc: 'Function .get failed when get item from store', err: e }))
          })
      } else {
        resolve(FormatResult['STORE_NOT_FOUND'])
      }
    } catch (e) {
      resolve(FormatResult['GET_ITEM_FAIL'].setData({ desc: 'Get item from store failed', err: e }))
    }
  })
}

/**
 * Open DB if it exists, otherwise create a new one before open.
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
          resolve(formatResult) // Resolve early if get DB info failed.
        }
      })
      .then(({registerToManager, storeList, dbVersion}) => {
        if (registerToManager) {
          return _registerDBToManager(dbName, storeList, dbVersion)
            .then((formatResult) => {
              if (formatResult.code === FormatResult['SUCC'].code) {
                return {storeList, dbVersion}
              } else {
                resolve(formatResult) // Resolve early if register to manager failed.
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
  return new Promise((resolve) => {
    _getDBInfo(dbName)
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
          resolve(formatResult)
        }
      })
      .then((db) => {
        resolve(FormatResult['SUCC'].setData({db}))
      })
      .catch((e) => {
        resolve(FormatResult['OPEN_DB_FAIL'].setData({ desc: 'Open DB without creation failed.', err: e }))
      })
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