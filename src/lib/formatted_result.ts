/**
 * @file Provide unified formatted result for idb-managed
 */
export class ResultFormatter {
    readonly code: number;
    readonly msg: string;
    data: any;
    constructor(theCode: number, theMsg: string) {
        this.code = theCode;
        this.msg = theMsg;
    }
    setData(supplyment: Object) {
        this.data = { ...this.data, ...supplyment };
        return this;
    }
    toString() {
        return `FormattedResult{code: ${this.code}, msg: ${this.msg}, data: ${JSON.stringify(this.data)}}`
    }
}

export default {
    DB_NOT_SUPPORT: new ResultFormatter(100, 'IndexedDB is not supported'),
    PARAM_INVALID: new ResultFormatter(101, 'Invalid parameter'),
    SUCC: new ResultFormatter(200, 'Successfully done'),
    DB_NOT_FOUND: new ResultFormatter(201, 'DB does not exist'),
    TABLE_NOT_FOUND: new ResultFormatter(202, 'Table does not exist'),
    OPEN_DB_FAIL: new ResultFormatter(203, 'Open DB failed'),
    ADD_ITEMS_FAIL: new ResultFormatter(204, 'Add items failed'),
    GET_ITEM_FAIL: new ResultFormatter(205, 'Get item failed'),
    GET_IN_RANGE_FAIL: new ResultFormatter(206, 'Get items in range failed'),
    DELETE_DB_FAIL: new ResultFormatter(208, 'Delete DB failed'),
    UNEXPECTED_ERR: new ResultFormatter(666, 'Some unexpected error happens')
};
