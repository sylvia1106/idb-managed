/**
 * @file Tests for idb-managed
 */
import IDBM from '../src/index';
// Ready for faked IndexedDB environment.
var fakeDB = require('fake-indexeddb');
var fakeDBIndex = require('fake-indexeddb/lib/FDBIndex');
var fakeDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
var fakeDBDataBase = require('fake-indexeddb/lib/FDBDatabase');
var fakeObjectStore = require('fake-indexeddb/lib/FDBObjectStore');
var fakeDBTransaction = require('fake-indexeddb/lib/FDBTransaction');
var fakeIDBCursor = require('fake-indexeddb/lib/FDBCursor');
var fakeIDBRequest = require('fake-indexeddb/lib/FDBRequest');
const TEST_DB_NAME = 'TEST_DB';
const DB_MANAGER_NAME = 'IDB_MANAGER_DB';
const TEST_TABLE_1 = 'table1';
const TEST_TABLE_PRIMARY_KEY = 'name';
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
describe('IndexedDB Env Test', () => {
    afterAll(() => {
        clearDBFromWindow();
    });
    test('IndexedDB is supported', () => {
        setDBInWindow();
        expect(IDBM.idbIsSupported()).toBe(true);
    });
    test('IndexedDB is not supported because no indexedDB exists', () => {
        clearDBFromWindow();
        expect(IDBM.idbIsSupported()).toBe(false);
    });
});
describe('IDBM APIs Test', () => {
    const DemoDB = new IDBM.CustomDB({
        dbName: TEST_DB_NAME,
        tables: {
            table1: {
                primaryKey: 'name',
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
    beforeAll(() => {
        setDBInWindow();
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
                item: { [TEST_TABLE_PRIMARY_KEY]: 'AAA', unionId: 'aaa' },
                itemDuration: 1000 * 3600
            },
            {
                tableName: TEST_TABLE_1,
                item: { [TEST_TABLE_PRIMARY_KEY]: 'BBB', unionId: 'bbb' },
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
    test('getItemsInRange', async () => {
        expect.assertions(2);
        const result = await DemoDB.getItemsInRange({
            tableName: TEST_TABLE_1,
            indexRange: {
                indexName: TEST_TABLE_PRIMARY_KEY,
                upperIndex: 'BBB',
                upperExclusive: false
            }
        });
        expect(result.length).toBe(2);
        expect(result[1].unionId).toBe('bbb');
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
        expect(getItems.length).toBe(1);
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
                item: { [TEST_TABLE_PRIMARY_KEY]: 'AAA', unionId: 'aaa' },
                itemDuration: interval
            }
        ]);
        setTimeout(async () => {
            await DemoDB.addItems([
                {
                    tableName: TEST_TABLE_1,
                    item: { [TEST_TABLE_PRIMARY_KEY]: 'BBB', unionId: 'bbb' },
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
