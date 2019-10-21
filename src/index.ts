import DBEnvChecker from './lib/db_env_checker';
import FormattedResult, { ResultFormatter } from './lib/formatted_result';
import DBWrapper from './db_wrapper';
let debug: boolean = true;
const DEFAULT_DB_VERSION: number = 1;
const DB_DOCS_URL = 'https://sylvia1106.github.io/idb-managed/';
const ParamCheckerEnum = {
    NonNegativeInteger: {
        rule: _isNonNegativeInteger,
        desc: 'needs to be a non-negative integer'
    },
    NotNullObject: {
        rule: (param: any) => {
            return param && typeof param === 'object';
        },
        desc: 'needs to be a not-null object'
    },
    String: {
        rule: (param: any) => {
            return typeof param === 'string';
        },
        desc: 'needs to be a string'
    },
    Array: {
        rule: (param: any) => {
            return param instanceof Array;
        },
        desc: 'needs to be an Array'
    },
    Boolean: {
        rule: (param: any) => {
            return typeof param === 'boolean';
        },
        desc: 'needs to be a boolean'
    }
};
const OPTIONAL = true;
function _debugger(fnName: string, result: ResultFormatter | Error): void {
    if (debug) {
        console.log(fnName, result);
    }
}
function _isNonNegativeInteger(x: any) {
    return !isNaN(x) && x >= 0;
}
function _optionWithBackup(param: any, backup: any) {
    return param !== undefined ? param : backup;
}
function _paramChecker(
    param: any,
    checker: ParamChecker,
    paramName: string,
    optional: boolean
): void {
    const exp = `${paramName} ${checker.desc}`;
    if (optional) {
        if (param !== undefined && !checker.rule(param)) {
            throw `${exp} if defined`;
        }
    } else {
        if (!checker.rule(param)) {
            throw `${exp}`;
        }
    }
}
function _customDBConfigChecker(dbConfig: DBConfig): void {
    _paramChecker(
        dbConfig,
        ParamCheckerEnum.NotNullObject,
        'dbConfig',
        !OPTIONAL
    );
    _paramChecker(
        dbConfig.dbName,
        ParamCheckerEnum.String,
        'dbName',
        !OPTIONAL
    );
    _paramChecker(
        dbConfig.dbVersion,
        ParamCheckerEnum.NonNegativeInteger,
        'dbVersion',
        OPTIONAL
    );
    _paramChecker(
        dbConfig.itemDuration,
        ParamCheckerEnum.NonNegativeInteger,
        'itemDuration of dbConfig',
        OPTIONAL
    );
    _paramChecker(
        dbConfig.tables,
        ParamCheckerEnum.NotNullObject,
        'tables',
        OPTIONAL
    );
    Object.keys(dbConfig.tables || {}).forEach(tableName => {
        const tableConfig = dbConfig.tables![tableName];
        _paramChecker(
            tableConfig.primaryKey,
            ParamCheckerEnum.String,
            'primaryKey',
            OPTIONAL
        );
        _paramChecker(
            tableConfig.itemDuration,
            ParamCheckerEnum.NonNegativeInteger,
            'itemDuration of table',
            OPTIONAL
        );
        _paramChecker(
            tableConfig.indexList,
            ParamCheckerEnum.Array,
            'indexList',
            OPTIONAL
        );
        (tableConfig.indexList || []).forEach(index => {
            _paramChecker(
                index.indexName,
                ParamCheckerEnum.String,
                'indexName',
                !OPTIONAL
            );
            _paramChecker(
                index.unique,
                ParamCheckerEnum.Boolean,
                'unique',
                OPTIONAL
            );
        });
    });
}

function _customDBAddItemsParamChecker(
    items: ItemInTable[],
    tableListInDB: TableConfig[]
): void {
    const tableNamesInDB = tableListInDB.map(table => table.tableName);
    _paramChecker(items, ParamCheckerEnum.Array, 'items', !OPTIONAL);
    items.forEach(item => {
        _paramChecker(
            item.tableName,
            ParamCheckerEnum.String,
            "item's tableName",
            !OPTIONAL
        );
        _paramChecker(
            item.itemDuration,
            ParamCheckerEnum.NonNegativeInteger,
            "item's itemDuration",
            OPTIONAL
        );
        if (tableNamesInDB.indexOf(item.tableName) < 0) {
            throw `Table ${item.tableName} does not exist`;
        }
    });
    // TODO item不包含自定义的primaryKey需要报错
}

export function idbIsSupported(): boolean {
    let supportResult = DBEnvChecker.getResult();
    _debugger('idbIsSupported', supportResult);
    return supportResult !== FormattedResult['DB_NOT_SUPPORT'];
}
export class CustomDB {
    readonly name: string;
    readonly version: number;
    readonly tableList: TableConfig[];
    readonly itemDuration?: MiliSeconds;
    constructor(dbConfig: DBConfig) {
        try {
            _customDBConfigChecker(dbConfig);
        } catch (errorMsg) {
            throw FormattedResult['PARAM_INVALID'].setData({
                desc: `${errorMsg}`
            });
        }
        this.name = dbConfig.dbName;
        this.version = _optionWithBackup(
            dbConfig.dbVersion,
            DEFAULT_DB_VERSION
        );
        this.tableList = Object.keys(dbConfig.tables || {}).map(tableName => {
            return {
                ...{ tableName: tableName },
                ...dbConfig.tables![tableName]
            };
        });
        this.itemDuration = dbConfig.itemDuration;
    }
    async addItems(items: ItemInTable[]) {
        const itemDurationOverrider = (ofDB: number | undefined, ofTable: number | undefined, ofItem: number | undefined) => {
            if (ofItem !== undefined) {
                return ofItem;
            } else if (ofTable !== undefined) {
                return ofTable;
            } else {
                return ofDB;
            }
        }
        try {
            _customDBAddItemsParamChecker(items, this.tableList);
        } catch (errorMsg) {
            throw FormattedResult['PARAM_INVALID'].setData({
                desc: `${errorMsg}`
            });
        }
        // Set itemDuration to each item
        const itemsWithDuration = items.map(item => {
            const theTable: TableConfig = this.tableList.find(
                table => table.tableName === item.tableName
            ) as TableConfig;
            return {
                ...{ itemDuration: itemDurationOverrider(this.itemDuration, theTable.itemDuration, item.itemDuration) },
                ...item
            };
        });
        try {
            await DBWrapper.addItems(this, itemsWithDuration);
            return FormattedResult['SUCC'];
        } catch (e) {
            _debugger('addItems', e);
            throw FormattedResult['ADD_ITEMS_FAIL'].setData({
                desc: `${e}`
            });
        }
    }
    async function getItem(tableName: string, primaryKeyValue: any) {
        try {
            return await DBWrapper.getItem(this, tableName, primaryKeyValue)
        } catch (errorMsg) {

        }
    }

    async function getItemsInRange(tableName: string, )
}
export default {
    idbIsSupported,
    CustomDB
};
