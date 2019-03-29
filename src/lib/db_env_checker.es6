import FormatResult from './formatted_result'
export default {
  /**
   * @returns {FormatResult} Result for IndexedDB compatibility check.
   */
  getResult: () => {
    try {
      ['indexedDB', 'IDBDatabase', 'IDBObjectStore', 'IDBTransaction', 'IDBIndex', 'IDBCursor', 'IDBKeyRange'].forEach((property) => {
        if (window) {
          if (!window[property]) {
            throw FormatResult['DB_NOT_SUPPORT'].setData({desc: `${property} is not supported in window.`})
          } else { /* Continue forEach loop */ }
        } else if (self) {
          if (!self[property]) {
            throw FormatResult['DB_NOT_SUPPORT'].setData({desc: `${property} is not supported in current sw.`})
          } else { /* Continue forEach loop */ }
        } else {
          throw FormatResult['DB_NOT_SUPPORT'].setData({desc: 'idb-managed can not run in non-browser environment.'})
        }
      })
      return FormatResult['SUCC'] // Current env is valid for IndexedDB
    } catch (resultOb) {
      return resultOb
    }
  }
}