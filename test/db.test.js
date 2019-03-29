const IDBManaged = require('../build/js/index.js').default
const fakeDB = require('fake-indexeddb')
const fakeDBIndex = require('fake-indexeddb/lib/FDBIndex')
const fakeDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange')
const fakeDBDataBase = require('fake-indexeddb/lib/FDBDatabase')
const fakeObjectStore = require('fake-indexeddb/lib/FDBObjectStore')
const fakeDBTransaction = require('fake-indexeddb/lib/FDBTransaction')
const fakeIDBCursor = require('fake-indexeddb/lib/FDBCursor')
describe('check DB compatibility', () => {
  test('checkNotSupportReason', () => {
    expect(IDBManaged.idbIsSupported()).toBe(false)
    window.indexedDB = fakeDB
    window.IDBIndex = fakeDBIndex
    window.IDBKeyRange = fakeDBKeyRange
    window.IDBDatabase = fakeDBDataBase
    window.IDBObjectStore = fakeObjectStore
    window.IDBTransaction = fakeDBTransaction
    window.IDBCursor = fakeIDBCursor
    expect(IDBManaged.idbIsSupported()).toBe(true)
  })
})