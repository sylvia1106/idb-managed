/**
 * @file Tests for idb-managed
 */
var fakeDB = require('fake-indexeddb');
var fakeDBIndex = require('fake-indexeddb/lib/FDBIndex');
var fakeDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
var fakeDBDataBase = require('fake-indexeddb/lib/FDBDatabase');
var fakeObjectStore = require('fake-indexeddb/lib/FDBObjectStore');
var fakeDBTransaction = require('fake-indexeddb/lib/FDBTransaction');
var fakeIDBCursor = require('fake-indexeddb/lib/FDBCursor');
var fakeIDBRequest = require('fake-indexeddb/lib/FDBRequest');
// Ready for faked IndexedDB environment before IDBM is required.
setDBInWindow();
var IDBM = require('../src/index');
const TEST_DB_NAME = 'TEST_DB';
const DB_MANAGER_NAME = 'IDB_MANAGER_DB';
const TEST_TABLE_1 = 'table1';
const TEST_TABLE_2 = 'table2';
const TEST_TABLE1_PRIMARY_KEY = 'name';
const TEST_TABLE2_PRIMARY_KEY = 'school';
function setDBInWindow() {
    // @ts-ignore
    window.indexedDB = fakeDB;
    // @ts-ignore
    window.IDBIndex = fakeDBIndex;
    // @ts-ignore
    window.IDBKeyRange = fakeDBKeyRange;
    // @ts-ignore
    window.IDBDatabase = fakeDBDataBase;
    // @ts-ignore
    window.IDBObjectStore = fakeObjectStore;
    // @ts-ignore
    window.IDBTransaction = fakeDBTransaction;
    // @ts-ignore
    window.IDBCursor = fakeIDBCursor;
    // @ts-ignore
    window.IDBRequest = fakeIDBRequest;
}
function clearDBFromWindow() {
    // @ts-ignore
    window.indexedDB = null;
}
describe('IndexedDB Env Tests', () => {
    test('IndexedDB is supported', () => {
        setDBInWindow();
        expect(IDBM.idbIsSupported()).toBe(true);
    });
    test('IndexedDB is not supported because no indexedDB exists', () => {
        clearDBFromWindow();
        expect(IDBM.idbIsSupported()).toBe(false);
        setDBInWindow();
    });
});
describe('IDBM APIs Tests', () => {
    const DemoDB = new IDBM.CustomDB({
        dbName: TEST_DB_NAME,
        tables: {
            [TEST_TABLE_1]: {
                primaryKey: TEST_TABLE1_PRIMARY_KEY,
                indexList: [
                    {
                        indexName: 'unionId',
                        unique: true
                    }
                ],
                itemDuration: 3000
            }
        },
        dbVersion: 1,
        itemDuration: 5000
    });
    afterAll(done => {
        const deleteReq1 = window.indexedDB.deleteDatabase(TEST_DB_NAME);
        deleteReq1.onsuccess = () => {
            const deleteReq2 = window.indexedDB.deleteDatabase(DB_MANAGER_NAME);
            deleteReq2.onsuccess = () => {
                done();
            };
        };
    });
    test('addItems', async () => {
        expect.assertions(1);
        const result = await DemoDB.addItems([
            {
                tableName: TEST_TABLE_1,
                item: { [TEST_TABLE1_PRIMARY_KEY]: 'AAA', unionId: 'aaa' },
                itemDuration: 1000 * 3600
            },
            {
                tableName: TEST_TABLE_1,
                item: { [TEST_TABLE1_PRIMARY_KEY]: 'BBB', unionId: 'bbb' },
                itemDuration: 1000 * 3600
            },
            {
                tableName: TEST_TABLE_1,
                item: { [TEST_TABLE1_PRIMARY_KEY]: 'CCC', unionId: 'ccc' },
                itemDuration: 1000 * 3600
            }
        ]);
        expect(result).toBe(undefined);
    });
    test('getItemsAfterAdd', async () => {
        expect.assertions(1);
        const result = await DemoDB.getItem(TEST_TABLE_1, 'AAA');
        expect(result!.unionId).toBe('aaa');
    });
    test('getItemFromDB', async () => {
        expect.assertions(1);
        const result = await IDBM.getItemFromDB(
            TEST_DB_NAME,
            TEST_TABLE_1,
            'AAA'
        );
        expect(result!.unionId).toBe('aaa');
    });
    test('getItemsInRange', async () => {
        expect.assertions(2);
        const result = await DemoDB.getItemsInRange({
            tableName: TEST_TABLE_1,
            indexRange: {
                indexName: TEST_TABLE1_PRIMARY_KEY,
                upperIndex: 'BBB',
                upperExclusive: false
            }
        });
        expect(result.length).toBe(2);
        expect(result[1].unionId).toBe('bbb');
    });
    test('getAllItems', async () => {
        expect.assertions(2);
        const result = await DemoDB.getItemsInRange({
            tableName: TEST_TABLE_1
        });
        expect(result.length).toBe(3);
        expect(result[2].unionId).toBe('ccc');
    });
    test('deleteItem', async () => {
        expect.assertions(2);
        const deleteResult = await DemoDB.deleteItemsInRange([
            {
                tableName: TEST_TABLE_1,
                indexRange: {
                    indexName: 'unionId',
                    onlyIndex: 'aaa'
                }
            }
        ]);
        expect(deleteResult).toBe(undefined);
        const getItems = await DemoDB.getItemsInRange({
            tableName: TEST_TABLE_1
        });
        expect(getItems.length).toBe(2);
    });
    test('deleteAllItems', async () => {
        expect.assertions(2);
        const deleteResult = await DemoDB.deleteItemsInRange([
            {
                tableName: TEST_TABLE_1
            }
        ]);
        expect(deleteResult).toBe(undefined);
        const getItems = await DemoDB.getItemsInRange({
            tableName: TEST_TABLE_1
        });
        expect(getItems.length).toBe(0);
    });
    test('deleteDB', async () => {
        expect.assertions(2);
        const result = await IDBM.deleteDB(TEST_DB_NAME);
        expect(result).toBe(undefined);
        const getItems = await DemoDB.getItemsInRange({
            tableName: TEST_TABLE_1
        });
        expect(getItems.length).toBe(0);
    });
    test('IDBM delete expired items before addItems', async () => {
        const interval = 1000;
        await DemoDB.addItems([
            {
                tableName: TEST_TABLE_1,
                item: { [TEST_TABLE1_PRIMARY_KEY]: 'AAA', unionId: 'aaa' },
                itemDuration: interval
            }
        ]);
        setTimeout(async () => {
            expect.assertions(1);
            await DemoDB.addItems([
                {
                    tableName: TEST_TABLE_1,
                    item: { [TEST_TABLE1_PRIMARY_KEY]: 'BBB', unionId: 'bbb' },
                    itemDuration: interval
                }
            ]);
            const itemsInTable = await DemoDB.getItemsInRange({
                tableName: TEST_TABLE_1
            });
            expect(itemsInTable.length).toBe(1);
        }, 2000);
    });
});
describe('Param Invalid Tests', () => {
    const DB1_NAME = 'TEST_DB_1';
    const dbNameList = [DB1_NAME, DB_MANAGER_NAME];
    const DB1 = new IDBM.CustomDB({
        dbName: DB1_NAME,
        tables: {
            [TEST_TABLE_1]: {
                primaryKey: TEST_TABLE1_PRIMARY_KEY,
                indexList: [
                    {
                        indexName: 'unionId',
                        unique: true
                    }
                ],
                itemDuration: 3000
            }
        },
        dbVersion: 1,
        itemDuration: 5000
    });
    function deleteRecursion(index: number, done: Function) {
        const req = window.indexedDB.deleteDatabase(dbNameList[index]);
        req.onsuccess = () => {
            if (index < dbNameList.length - 1) {
                deleteRecursion(index + 1, done);
            } else {
                done();
            }
        };
    }
    afterEach(done => {
        deleteRecursion(0, done);
    });
    test('DB config is invalid', async () => {
        try {
            const DBInvalid = new IDBM.CustomDB({})
        } catch (e) {
            expect(e.message).toBe('dbName needs to be a string')
        }
    })
    test('IndexRange param is not valid when getItemsInRange', async () => {
        await DB1.addItems([
            {
                tableName: TEST_TABLE_1,
                item: {
                    [TEST_TABLE1_PRIMARY_KEY]: 'AAA',
                    unionId: 'aaa',
                    noIndex: 'xxx'
                }
            }
        ]);
        try {
            await DB1.getItemsInRange({
                tableName: TEST_TABLE_1,
                indexRange: {
                    indexName: TEST_TABLE1_PRIMARY_KEY
                }
            });
        } catch (e) {
            expect(e.message).toBe(
                'indexRange should have bounds or value for the index'
            );
        }
    });
})

describe('IDBM Exception Tests', () => {
    const DB1_NAME = 'TEST_DB_1';
    const DB2_NAME = 'TEST_DB_2';
    const dbNameList = [DB1_NAME, DB2_NAME, DB_MANAGER_NAME];
    function deleteRecursion(index: number, done: Function) {
        const req = window.indexedDB.deleteDatabase(dbNameList[index]);
        req.onsuccess = () => {
            if (index < dbNameList.length - 1) {
                deleteRecursion(index + 1, done);
            } else {
                done();
            }
        };
    }
    const DB1 = new IDBM.CustomDB({
        dbName: DB1_NAME,
        tables: {
            [TEST_TABLE_1]: {
                primaryKey: TEST_TABLE1_PRIMARY_KEY,
                indexList: [
                    {
                        indexName: 'unionId',
                        unique: true
                    }
                ],
                itemDuration: 3000
            },
            [TEST_TABLE_2]: {
                primaryKey: TEST_TABLE2_PRIMARY_KEY,
                indexList: [
                    {
                        indexName: 'serialId',
                        unique: true
                    }
                ]
            }
        },
        dbVersion: 1,
        itemDuration: 5000
    });
    afterEach(done => {
        deleteRecursion(0, done);
    });
    test('Item does not have primaryKey when addItems', async () => {
        expect.assertions(1);
        try {
            await DB1.addItems([
                {
                    tableName: TEST_TABLE_1,
                    item: { unionId: 'aaa' }
                }
            ]);
        } catch (e) {
            expect(e.message).toBe(
                `primaryKey is needed for item in table ${TEST_TABLE_1}`
            );
        }
    });
    test('When unique index duplicates, check addItems is atomic', async () => {
        expect.assertions(2);
        try {
            await DB1.addItems([
                {
                    tableName: TEST_TABLE_2,
                    item: { [TEST_TABLE2_PRIMARY_KEY]: 'ABC', serialId: '123' }
                },
                {
                    tableName: TEST_TABLE_1,
                    item: { [TEST_TABLE1_PRIMARY_KEY]: 'AAA', unionId: 'aaa' }
                },
                {
                    tableName: TEST_TABLE_1,
                    item: { [TEST_TABLE1_PRIMARY_KEY]: 'BBB', unionId: 'aaa' }
                }
            ]);
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
        const result = await DB1.getItemsInRange({
            tableName: TEST_TABLE_2
        });
        expect(result.length).toBe(0);
    });
    test('When deleteItems with wrong index', async () => {
        expect.assertions(2);
        await DB1.addItems([
            {
                tableName: TEST_TABLE_2,
                item: { [TEST_TABLE2_PRIMARY_KEY]: 'ABC', serialId: '123' }
            },
            {
                tableName: TEST_TABLE_1,
                item: {
                    [TEST_TABLE1_PRIMARY_KEY]: 'AAA',
                    unionId: 'aaa',
                    noIndex: 'xxx'
                }
            },
            {
                tableName: TEST_TABLE_1,
                item: {
                    [TEST_TABLE1_PRIMARY_KEY]: 'BBB',
                    unionId: 'bbb',
                    noIndex: 'yyy'
                }
            }
        ]);
        try {
            await DB1.deleteItemsInRange([
                {
                    tableName: TEST_TABLE_2
                },
                {
                    tableName: TEST_TABLE_1,
                    indexRange: {
                        indexName: 'noIndex',
                        lowerIndex: 'yyy'
                    }
                }
            ]);
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
        const result = await DB1.getItemsInRange({
            tableName: TEST_TABLE_2
        });
        expect(result.length).toBe(1);
    });
    test('DB is not found when getItem', async () => {
        const result = await IDBM.getItemFromDB('NO_DB', 'xxx', 'yyy');
        expect(result).toBeNull();
    });
    test('Table is not found when getItem', async () => {
        await DB1.addItems([
            {
                tableName: TEST_TABLE_2,
                item: { [TEST_TABLE2_PRIMARY_KEY]: 'ABC', serialId: '123' }
            }
        ]);
        const result = await IDBM.getItemFromDB(DB1_NAME, 'wrongTable', 'ABC');
        expect(result).toBeNull();
    });
});
