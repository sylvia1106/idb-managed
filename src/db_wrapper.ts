/**
 * @file Wrap idb APIs for idb-managed
 */
import { deduplicateList } from './lib/utils';
import {
    IndexRange,
    ItemConfig,
    TableConfig,
    IndexOfTable,
    TableIndexRange
} from './interface';
const IDB = require('./lib/idb');
const IDB_MANAGER_VERSION = 1;
const IDB_MANAGER_DB_NAME = 'IDB_MANAGER_DB';
const IDB_MANAGER_DB_TABLE_NAME = 'IDB_MANAGER_STORE';
const IDB_MANAGER_DB_TABLE_INDEX_NAME = 'dbName';
const UPDATETIME_KEYNAME = 'updateTime';
const EXPIRETIME_KEYNAME = 'expireTime';
interface ItemInDBManager {
    dbName: string;
    tableList: TableConfig[];
    version: number;
}
interface ItemInTable {
    [key: string]: any;
    expireTime: number;
    updateTime: number;
}
interface DB {
    name: string;
    tableList: TableConfig[];
    version: number;
}
function indexRange2DBKey (indexRange: IndexRange) {
    const {
        onlyIndex,
        lowerIndex,
        upperIndex,
        lowerExclusive = false,
        upperExclusive = false
    } = indexRange;
    if (onlyIndex !== undefined) {
        return IDBKeyRange.only(onlyIndex);
    } else if (lowerIndex !== undefined && upperIndex !== undefined) {
        return IDBKeyRange.bound(
            lowerIndex,
            upperIndex,
            lowerExclusive,
            upperExclusive
        );
    } else if (lowerIndex !== undefined) {
        return IDBKeyRange.lowerBound(lowerIndex, lowerExclusive);
    } else {
        return IDBKeyRange.upperBound(upperIndex, upperExclusive);
    }
}

function itemWrapper (itemConfig: ItemConfig): ItemInTable {
    const currentTime = Date.now();
    return {
        ...itemConfig.item,
        [UPDATETIME_KEYNAME]: currentTime,
        [EXPIRETIME_KEYNAME]:
            itemConfig.itemDuration !== undefined
                ? itemConfig.itemDuration + currentTime
                : -1
    };
}

function itemUnwrapper (item: ItemInTable) {
    if (!item) {
        return null;
    } else if (item.expireTime > 0 && item.expireTime < Date.now()) {
        return null;
    } else {
        delete item.updateTime;
        delete item.expireTime;
        return item;
    }
}

async function registerDBInManager (dbInfo: DB) {
    const dbManager = await openDBManager();
    const dbAlreadyInManager = ((await getItemFromDB(
        dbManager as any,
        IDB_MANAGER_DB_TABLE_NAME,
        dbInfo.name
    )) as any) as ItemInDBManager;
    if (!dbAlreadyInManager || dbInfo.version > dbAlreadyInManager.version) {
        // Update db in manager
        const addDBTrans = dbManager.transaction(
            IDB_MANAGER_DB_TABLE_NAME,
            'readwrite'
        );
        const table = addDBTrans.objectStore(IDB_MANAGER_DB_TABLE_NAME);
        const dbItem: ItemInDBManager = {
            dbName: dbInfo.name,
            tableList: dbInfo.tableList,
            version: dbInfo.version
        };
        table.put(
            itemWrapper({
                item: dbItem,
                tableName: IDB_MANAGER_DB_TABLE_NAME
            })
        );
        await addDBTrans.complete;
        dbManager.close();
    }
}

async function unregisterDBInManager (dbName: string) {
    const dbManager = await openDBManager();
    const deleteTrans = dbManager.transaction(
        IDB_MANAGER_DB_TABLE_NAME,
        'readwrite'
    );
    const table = deleteTrans.objectStore(IDB_MANAGER_DB_TABLE_NAME);
    table.delete(dbName);
    await deleteTrans.complete;
    dbManager.close();
}

async function createDB (dbInfo: DB) {
    await registerDBInManager(dbInfo);
    const db = await IDB.open(
        dbInfo.name,
        dbInfo.version as number,
        (upgradeDB: any) => {
            upgradeDBWithTableList(upgradeDB as any, dbInfo.tableList);
        }
    );
    return db;
}

async function openDBManager () {
    return await IDB.open(
        IDB_MANAGER_DB_NAME,
        IDB_MANAGER_VERSION,
        // In case DB Manager has not been created.
        (upgradeDB: any) => {
            upgradeDBManager(upgradeDB as any);
        }
    );
}

async function openDB (dbName: string) {
    const dbManager = await openDBManager();
    const dbAlreadyInManager = ((await getItemFromDB(
        dbManager as any,
        IDB_MANAGER_DB_TABLE_NAME,
        dbName
    )) as any) as ItemInDBManager | null;
    dbManager.close();
    if (dbAlreadyInManager) {
        const db = await IDB.open(
            dbAlreadyInManager.dbName,
            dbAlreadyInManager.version as number,
            // In case this DB has not been created.
            (upgradeDB: any) => {
                upgradeDBWithTableList(
                    upgradeDB as any,
                    dbAlreadyInManager.tableList || []
                );
            }
        );
        return db;
    } else {
        return null;
    }
}

async function getItemFromDB (
    db: IDBDatabase,
    tableName: string,
    primaryKeyValue: any
) {
    if (db.objectStoreNames.contains(tableName)) {
        const trans: any = db.transaction(tableName, 'readonly');
        const table = trans.objectStore(tableName);
        try {
            const itemInTable = ((await table.get(
                primaryKeyValue
            )) as any) as ItemInTable;
            await trans.complete;
            return itemUnwrapper(itemInTable) as any;
        } catch (error) {
            try {
                await trans.complete;
            } catch (e) {
            }
            throw error;
        }
    } else {
        return null;
    }
}

function upgradeDBManager (upgradeDB: IDBDatabase) {
    upgradeDB.createObjectStore(IDB_MANAGER_DB_TABLE_NAME, {
        keyPath: IDB_MANAGER_DB_TABLE_INDEX_NAME
    });
}

function upgradeDBWithTableList (
    upgradeDB: IDBDatabase,
    tableList: TableConfig[]
) {
    try {
        tableList.forEach(tableConfig => {
            // If table already exists.
            if (
                upgradeDB.objectStoreNames.contains(
                    tableConfig.tableName as string
                )
            ) {
                const currentTable = upgradeDB
                    .transaction(tableConfig.tableName as string)
                    .objectStore(tableConfig.tableName as string);
                // Create new index for present table.
                (tableConfig.indexList || []).forEach(
                    (theIndex: IndexOfTable) => {
                        if (
                            !currentTable.indexNames.contains(
                                theIndex.indexName
                            )
                        ) {
                            currentTable.createIndex(
                                theIndex.indexName,
                                theIndex.indexName,
                                { unique: theIndex.unique }
                            );
                        }
                    }
                );
                // Else create new table.
            } else {
                const tablePrimaryKey = tableConfig.primaryKey || 'id';
                const tableToCreate = upgradeDB.createObjectStore(
                    tableConfig.tableName as string,
                    {
                        keyPath: tablePrimaryKey,
                        ...(tablePrimaryKey === 'id'
                            ? { autoIncrement: true }
                            : {})
                    }
                );
                // Set index of primaryKey.
                tableToCreate.createIndex(tablePrimaryKey, tablePrimaryKey, {
                    unique: true
                });
                // Set indexes defined in tableConfig
                (tableConfig.indexList || []).forEach(
                    (theIndex: IndexOfTable) => {
                        tableToCreate.createIndex(
                            theIndex.indexName,
                            theIndex.indexName,
                            { unique: theIndex.unique }
                        );
                    }
                );
                // Set index of updateTime for data ordering priority.
                tableToCreate.createIndex(
                    UPDATETIME_KEYNAME,
                    UPDATETIME_KEYNAME,
                    { unique: false }
                );
                // Set index of expireTime for expired data deletion.
                tableToCreate.createIndex(
                    EXPIRETIME_KEYNAME,
                    EXPIRETIME_KEYNAME,
                    { unique: false }
                );
            }
        });
    } catch (e) {
        upgradeDB.close(); // Close upgraded DB to trigger the failure of this opening process.
    }
}

async function atomicTrans (transaction: any, db: any, tryStatement: Function) {
    try {
        await tryStatement();
        await transaction.complete;
    } catch (transError) {
        try {
            // To roll back all operations in this transaction if any error happens.
            transaction.abort();
        } catch (e) {
            // Do nothing if transaction abort failed.
        }
        try {
            // To catch the Promise error caused by transaction abortion. Otherwise, uncaught rejection will be thrown up.
            await transaction.complete;
        } catch (e) {
        }
        // Throw specific error happened in tryStatement.
        throw transError;
    } finally {
        db.close();
    }
}

async function deleteItemsFromDB (db: any, tableIndexRanges: TableIndexRange[]) {
    const validRanges = tableIndexRanges.filter(indexRange => {
        return db.objectStoreNames.contains(indexRange.tableName);
    });
    const dedupTableNameList: string[] = deduplicateList(validRanges.map(tableIndexRange => tableIndexRange.tableName));
    const deleteItemsTrans = db.transaction(dedupTableNameList, 'readwrite');
    await atomicTrans(deleteItemsTrans, db, async () => {
        await Promise.all(validRanges.map(tableIndexRange => {
            const { tableName, indexRange } = tableIndexRange;
            const table = deleteItemsTrans.objectStore(tableName);
            if (!indexRange) {
                return table.clear();
            } else {
                return new Promise(function (resolve) {
                    table.index(indexRange.indexName).iterateCursor(indexRange2DBKey(indexRange), (cursor: any) => {
                        if (!cursor) {
                            resolve();
                            return;
                        }
                        table.delete(cursor.primaryKey);
                        cursor.continue();
                    });
                });
            }

        }));
    });
}

export async function addItems (dbInfo: DB, items: ItemConfig[]) {
    const dedupTableNameList: string[] = deduplicateList(
        items.map(item => item.tableName)
    );
    await deleteItems(
        dbInfo.name,
        dedupTableNameList.map(tableName => {
            return {
                tableName: tableName,
                indexRange: {
                    indexName: EXPIRETIME_KEYNAME,
                    upperIndex: +new Date(),
                    upperExclusive: false
                }
            };
        })
    );
    const db = await createDB(dbInfo);
    const addItemsTrans = db.transaction(dedupTableNameList, 'readwrite');
    await atomicTrans(addItemsTrans, db, async () => {
        await Promise.all(items.map(item => addItemsTrans.objectStore(item.tableName).put(itemWrapper(item))
        ));
    });
}

export async function getItem (
    dbName: string,
    tableName: string,
    primaryKeyValue: any
) {
    const db = await openDB(dbName);
    if (db) {
        try {
            const item = await getItemFromDB(
                (db as any) as IDBDatabase,
                tableName,
                primaryKeyValue
            );
            return item;
        } catch (e) {
            throw e;
        } finally {
            db.close();
        }
    } else {
        return null;
    }
}

export async function getItemsInRange (
    dbName: string,
    tableIndexRange: TableIndexRange
) {
    const { tableName, indexRange } = tableIndexRange;
    const db = await openDB(dbName);
    if (db) {
        try {
            let items: any[] = [];
            if (!db.objectStoreNames.contains(tableName)) {
                // Do nothing if table does not exist.
            } else {
                const trans = db.transaction(tableName, 'readonly');
                const table = trans.objectStore(tableName);
                try {
                    if (!indexRange) {
                        // Get all items in table if indexRange is undefined
                        let wrappedItems = await table.getAll();
                        items = (wrappedItems || [])
                            .map(itemUnwrapper)
                            .filter((item: any) => {
                                return item !== null;
                            });
                    } else {
                        await new Promise(function (resolve) {
                            table.index(indexRange.indexName).iterateCursor(indexRange2DBKey(indexRange), (cursor: any) => {
                                if (!cursor) {
                                    resolve();
                                    return;
                                }
                                var item = itemUnwrapper(cursor.value);
                                item && items.push(item);
                                cursor.continue();
                            });
                        });
                    }
                    await trans.complete;
                } catch (error) {
                    try {
                        await trans.complete;
                    } catch (e) {
                    }
                    throw error;
                }
            }
            return items;
        } catch (e) {
            throw e;
        } finally {
            db.close();
        }
    } else {
        return [];
    }
}

export async function deleteDB (dbName: string) {
    await unregisterDBInManager(dbName);
    await IDB.delete(dbName);
}

export async function deleteItems (
    dbName: string,
    tableIndexRanges: TableIndexRange[]
) {
    const db = await openDB(dbName);
    if (db) {
        await deleteItemsFromDB(db, tableIndexRanges);
    } else {
        // If db does not exist, no need to deleteItems at all.
        return;
    }
}

export default {
    addItems,
    getItem,
    getItemsInRange,
    deleteDB,
    deleteItems
};
