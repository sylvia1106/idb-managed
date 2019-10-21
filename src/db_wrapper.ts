/**
 * @file Wrap idb apis for idb-managed
 */
import { CustomDB } from './index'
import { openDB as IDBOpenDB } from 'idb';
import { deduplicateList } from './lib/utils';
import FormattedResult from './lib/formatted_result';
const IDB_MANAGER_DB_NAME = 'IDB_MANAGER_DB';
const IDB_MANAGER_DB_STORE_NAME = 'IDB_MANAGER_STORE';
const IDB_MANAGER_DB_STORE_INDEX_NAME = 'dbName';
const UPDATETIME_KEYNAME = 'updateTime';
const EXPIRETIME_KEYNAME = 'expireTime';
function itemWrapper(itemInTable: ItemInTable) {
    const currentTime = Date.now();
    return {
        ...itemInTable.item,
        ...{
            [UPDATETIME_KEYNAME]: currentTime,
            [EXPIRETIME_KEYNAME]:
                itemInTable.itemDuration !== undefined
                    ? itemInTable.itemDuration + currentTime
                    : -1
        }
    };
}

function registerDBToManager() {}

async function createDB(dbConfig: DB) {
    // TODO register
    const db = await IDBOpenDB(dbConfig.name, dbConfig.version as number, {
        upgrade(upgradeDB) {
            upgradeDBWithTableList(upgradeDB as any, dbConfig.tableList);
        }
    });
    return db;
}

async function openDB(dbName: string) {
    const dbManager = await IDBOpenDB(IDB_MANAGER_DB_NAME, 1, {
        upgrade(upgradeDB) {
            upgradeDBManager(upgradeDB as any);
        }
    });
    const dbInfo = await getItemFromDB(dbManager as any, IDB_MANAGER_DB_STORE_NAME, dbName);
    if (dbInfo) {
        createDB({
            // TODO
            // name: dbName,
            // version: dbInfo.version as number,
            // tableList: dbInfo.tableList
        })
    } else {
        throw FormattedResult['DB_NOT_FOUND'];
    }
}

async function getItemFromDB(db: IDBDatabase, tableName: string, primaryKeyValue: any) {
    if (db.objectStoreNames.contains(tableName)) {
        const trans = db.transaction(tableName, 'readonly');
        const table = trans.objectStore(tableName);
        const itemValue = await table.get(primaryKeyValue);
        if (!itemValue) {
            return null;
        // FIXME
        // } else if (itemValue[EXPIRETIME_KEYNAME] > 0 || itemValue[EXPIRETIME_KEYNAME] < Date.now()) {
        //     return null;
        } else {
            return itemValue;
        }
    } else {
        throw FormattedResult['TABLE_NOT_FOUND'];
    }
}

function upgradeDBManager(upgradeDB: IDBDatabase) {
    upgradeDB.createObjectStore(IDB_MANAGER_DB_STORE_NAME, {
        keyPath: IDB_MANAGER_DB_STORE_INDEX_NAME
    });
}

function upgradeDBWithTableList(
    upgradeDB: IDBDatabase,
    tableList: TableConfig[]
) {
    try {
        tableList.map(tableConfig => {
            // If table already exists.
            if (
                upgradeDB.objectStoreNames.contains(
                    tableConfig.tableName as string
                )
            ) {
                const upgradeDBTrans = upgradeDB.transaction(
                    tableConfig.tableName as string,
                    'readonly'
                );
                const currentTable = upgradeDBTrans.objectStore(
                    tableConfig.tableName as string
                );
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
                        ...{ keyPath: tablePrimaryKey },
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

export async function addItems(customDB: CustomDB, items: ItemInTable[]) {
    const db = await createDB(customDB);
    const dedupTableNameList = deduplicateList(
        items.map(item => item.tableName)
    );
    const addItemsTrans = db.transaction(dedupTableNameList, 'readwrite');
    items.forEach(item => {
        const table = addItemsTrans.objectStore(item.tableName);
        table.put(itemWrapper(item));
    });
    await addItemsTrans.done;
}

export async function getItem() {}

export async function getItemsInRange() {}

export default {
    addItems,
    getItem,
    getItemsInRange
};
