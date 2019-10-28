/**
 * @file Provide unified formatted result for idb-managed
 */
export declare class ResultFormatter {
    readonly code: number;
    readonly msg: string;
    data: any;
    constructor(theCode: number, theMsg: string);
    setData(supplyment: Object): this;
    toString(): string;
}
declare const _default: {
    readonly DB_NOT_SUPPORT: ResultFormatter;
    readonly PARAM_INVALID: ResultFormatter;
    readonly SUCC: ResultFormatter;
    readonly DB_NOT_FOUND: ResultFormatter;
    readonly TABLE_NOT_FOUND: ResultFormatter;
    readonly OPEN_DB_FAIL: ResultFormatter;
    readonly ADD_ITEMS_FAIL: ResultFormatter;
    readonly GET_ITEM_FAIL: ResultFormatter;
    readonly GET_IN_RANGE_FAIL: ResultFormatter;
    readonly DELETE_ITEMS_FAIL: ResultFormatter;
    readonly DELETE_DB_FAIL: ResultFormatter;
    readonly UNEXPECTED_ERR: ResultFormatter;
};
export default _default;
