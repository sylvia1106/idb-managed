/**
 * @file IndexedDB compatibility checker
 */
export default function(): void {
    if (!window) {
        throw new Error('idb-managed can not run in non-browser environment');
    }
    for (const property of [
        'indexedDB',
        'IDBDatabase',
        'IDBObjectStore',
        'IDBTransaction',
        'IDBIndex',
        'IDBCursor',
        'IDBKeyRange'
    ]) {
        if (!window.hasOwnProperty(property)) {
            throw new Error(`${property} is not supported in window`);
        }
    }
}
