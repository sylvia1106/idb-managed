/**
 * @file IndexedDB compatibility checker
 */
import FormattedResult, { ResultFormatter } from './formatted_result';
export default {
    getResult: function(): ResultFormatter {
        if (!window) {
            return FormattedResult['DB_NOT_SUPPORT'].setData({
                desc: 'idb-managed can not run in non-browser environment'
            });
        }
        try {
            [
                'indexedDB',
                'IDBDatabase',
                'IDBObjectStore',
                'IDBTransaction',
                'IDBIndex',
                'IDBCursor',
                'IDBKeyRange'
            ].forEach(property => {
                if (!window.hasOwnProperty(property)) {
                    throw FormattedResult['DB_NOT_SUPPORT'].setData({
                        desc: `${property} is not supported in window`
                    });
                }
            });
            return FormattedResult['SUCC'];
        } catch (resultOb) {
            return resultOb;
        }
    }
};
