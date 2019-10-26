import DBEnvChecker from './lib/db_env_checker';
import FormattedResult from './lib/formatted_result';
import DBWrapper from './db_wrapper';
import { ParamCheckerEnum, paramChecker, optionWithBackup } from './lib/utils';
const DEFAULT_DB_VERSION: number = 1;
const OPTIONAL = true;
function _customDBConfigChecker(dbConfig: DBConfig): void {
    paramChecker(
        dbConfig,
        ParamCheckerEnum.NotNullObject,
        'dbConfig',
        !OPTIONAL
    );
    paramChecker(dbConfig.dbName, ParamCheckerEnum.String, 'dbName', !OPTIONAL);
    paramChecker(
        dbConfig.dbVersion,
        ParamCheckerEnum.NonNegativeInteger,
        'dbVersion',
        OPTIONAL
    );
    paramChecker(
        dbConfig.itemDuration,
        ParamCheckerEnum.NonNegativeInteger,
        'itemDuration of dbConfig',
        OPTIONAL
    );
    paramChecker(
        dbConfig.tables,
        ParamCheckerEnum.NotNullObject,
        'tables',
        OPTIONAL
    );
    Object.keys(dbConfig.tables || {}).forEach(tableName => {
        const tableConfig = dbConfig.tables![tableName];
        paramChecker(
            tableConfig.primaryKey,
            ParamCheckerEnum.String,
            'primaryKey',
            OPTIONAL
        );
        paramChecker(
            tableConfig.itemDuration,
            ParamCheckerEnum.NonNegativeInteger,
            'itemDuration of table',
            OPTIONAL
        );
        paramChecker(
            tableConfig.indexList,
            ParamCheckerEnum.Array,
            'indexList',
            OPTIONAL
        );
        (tableConfig.indexList || []).forEach(index => {
            paramChecker(
                index.indexName,
                ParamCheckerEnum.String,
                'indexName',
                !OPTIONAL
            );
            paramChecker(
                index.unique,
                ParamCheckerEnum.Boolean,
                'unique',
                OPTIONAL
            );
        });
    });
}

function _customDBAddItemsParamChecker(
    items: ItemConfig[],
    tableListInDB: TableConfig[]
): void {
    const tableNamesInDB = tableListInDB.map(table => table.tableName);
    paramChecker(items, ParamCheckerEnum.Array, 'items', !OPTIONAL);
    items.forEach(item => {
        paramChecker(
            item.tableName,
            ParamCheckerEnum.String,
            "item's tableName",
            !OPTIONAL
        );
        paramChecker(
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

function indexRangeParamChecker(indexRange?: IndexRange): void {
    paramChecker(
        indexRange,
        ParamCheckerEnum.NotNullObject,
        'indexRange',
        OPTIONAL
    );
    if (indexRange) {
        paramChecker(
            indexRange.indexName,
            ParamCheckerEnum.String,
            "indexRange's indexName",
            !OPTIONAL
        );
        paramChecker(
            indexRange.lowerExclusive,
            ParamCheckerEnum.Boolean,
            "indexRange's lowerExclusive",
            OPTIONAL
        );
        paramChecker(
            indexRange.upperExclusive,
            ParamCheckerEnum.Boolean,
            "indexRange's upperExclusive",
            OPTIONAL
        );
    }
}

export function idbIsSupported(): boolean {
    let supportResult = DBEnvChecker.getResult();
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
        } catch (errMsg) {
            throw FormattedResult['PARAM_INVALID'].setData({
                desc: `${errMsg}`
            });
        }
        this.name = dbConfig.dbName;
        this.version = optionWithBackup(dbConfig.dbVersion, DEFAULT_DB_VERSION);
        this.tableList = Object.keys(dbConfig.tables || {}).map(tableName => {
            return {
                ...{ tableName: tableName },
                ...dbConfig.tables![tableName]
            };
        });
        this.itemDuration = dbConfig.itemDuration;
    }
    async addItems(items: ItemConfig[]) {
        const itemDurationOverrider = (
            ofDB: number | undefined,
            ofTable: number | undefined,
            ofItem: number | undefined
        ) => {
            if (ofItem !== undefined) {
                return ofItem;
            } else if (ofTable !== undefined) {
                return ofTable;
            } else {
                return ofDB;
            }
        };
        try {
            try {
                _customDBAddItemsParamChecker(items, this.tableList);
            } catch (errMsg) {
                throw FormattedResult['PARAM_INVALID'].setData({
                    desc: `${errMsg}`
                });
            }
            // Set backup itemDuration to each item
            const itemsWithDuration = items.map(item => {
                const theTable: TableConfig = this.tableList.find(
                    table => table.tableName === item.tableName
                ) as TableConfig;
                return {
                    ...{
                        itemDuration: itemDurationOverrider(
                            this.itemDuration,
                            theTable.itemDuration,
                            item.itemDuration
                        )
                    },
                    ...item
                };
            });
            await DBWrapper.addItems(this, itemsWithDuration);
            return FormattedResult['SUCC'];
        } catch (e) {
            throw FormattedResult['ADD_ITEMS_FAIL'].setData({
                desc: `${e}`
            });
        }
    }
    async getItem(tableName: string, primaryKeyValue: any) {
        try {
            return await DBWrapper.getItem(
                this.name,
                tableName,
                primaryKeyValue
            );
        } catch (e) {
            throw FormattedResult['GET_ITEM_FAIL'].setData({
                desc: `${e}`
            });
        }
    }

    async getItemsInRange(tableName: string, indexRange?: IndexRange) {
        try {
            try {
                indexRangeParamChecker(indexRange);
            } catch (errMsg) {
                throw FormattedResult['PARAM_INVALID'].setData({
                    desc: `${errMsg}`
                });
            }
            return await DBWrapper.getItemsInRange(
                this.name,
                tableName,
                indexRange
            );
        } catch (e) {
            throw FormattedResult['GET_IN_RANGE_FAIL'].setData({
                desc: `${e}`
            });
        }
    }

    async deleteItems(items: { tableName: string; indexRange: IndexRange }[]) {
        try {
            await DBWrapper.deleteItems(this.name, items);
            return FormattedResult['SUCC'];
        } catch (e) {
            throw FormattedResult['DELETE_ITEMS_FAIL'].setData({
                desc: `${e}`
            });
        }
    }
}

export async function deleteDB(dbName: string) {
    try {
        paramChecker(dbName, ParamCheckerEnum.String, 'dbName', !OPTIONAL);
    } catch (errMsg) {
        throw FormattedResult['PARAM_INVALID'].setData({
            desc: `${errMsg}`
        });
    }
    try {
        await DBWrapper.deleteDB(dbName);
        return FormattedResult['SUCC'];
    } catch (e) {
        throw FormattedResult['DELETE_DB_FAIL'].setData({
            desc: `${e}`
        });
    }
}
export default {
    idbIsSupported,
    CustomDB,
    deleteDB
};
