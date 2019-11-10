import dbEnvChecker from './lib/db_env_checker';
import DBWrapper from './db_wrapper';
import { ParamCheckerEnum, paramChecker, optionWithBackup } from './lib/utils';
import {
    DBConfig,
    ItemConfig,
    TableConfig,
    TableIndexRange,
    MiliSeconds
} from './interface';
export * from './interface';
const DEFAULT_DB_VERSION: number = 1;
const OPTIONAL = true;

function customDBConfigChecker(dbConfig: DBConfig): void {
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

function customDBAddItemsParamChecker(
    items: ItemConfig[],
    tableListInDB: TableConfig[]
): void {
    paramChecker(items, ParamCheckerEnum.Array, 'items', !OPTIONAL);
    items.forEach(itemOfTable => {
        paramChecker(
            itemOfTable.tableName,
            ParamCheckerEnum.String,
            "item's tableName",
            !OPTIONAL
        );
        paramChecker(
            itemOfTable.itemDuration,
            ParamCheckerEnum.NonNegativeInteger,
            "item's itemDuration",
            OPTIONAL
        );
        const theTable = tableListInDB.filter(
            table => table.tableName === itemOfTable.tableName
        )[0];
        if (!theTable) {
            throw new Error(`Table ${itemOfTable.tableName} does not exist`);
        } else if (
            theTable.primaryKey !== undefined &&
            Object.getOwnPropertyNames(itemOfTable.item).indexOf(
                theTable.primaryKey
            ) < 0
        ) {
            throw new Error(`primaryKey is needed for item in table ${itemOfTable.tableName}`);
        }
    });
}

function tableIndexRangeParamChecker(tableIndexRange: TableIndexRange): void {
    paramChecker(
        tableIndexRange,
        ParamCheckerEnum.NotNullObject,
        'tableIndexRange',
        !OPTIONAL
    );
    paramChecker(
        tableIndexRange.tableName,
        ParamCheckerEnum.String,
        "tableIndexRange's",
        !OPTIONAL
    );
    paramChecker(
        tableIndexRange.indexRange,
        ParamCheckerEnum.NotNullObject,
        "tableIndexRange's indexRange",
        OPTIONAL
    );
    if (tableIndexRange.indexRange) {
        const {
            indexName,
            onlyIndex,
            lowerIndex,
            upperIndex,
            lowerExclusive,
            upperExclusive,
        } = tableIndexRange.indexRange;
        paramChecker(
            indexName,
            ParamCheckerEnum.String,
            "indexRange's indexName",
            !OPTIONAL
        );
        if (onlyIndex === undefined && lowerIndex === undefined && upperIndex === undefined) {
            throw new Error('indexRange should have bounds or value for the index')
        } else if (lowerIndex !== undefined && upperIndex !== undefined && lowerIndex >= upperIndex) {
            throw new Error('lowerIndex should be less than upperIndex')
        } 
        if (lowerIndex && upperIndex)
        paramChecker(
            lowerExclusive,
            ParamCheckerEnum.Boolean,
            "indexRange's lowerExclusive",
            OPTIONAL
        );
        paramChecker(
            upperExclusive,
            ParamCheckerEnum.Boolean,
            "indexRange's upperExclusive",
            OPTIONAL
        );
    }
}

export function idbIsSupported(): boolean {
    try {
        dbEnvChecker();
        return true;
    } catch (e) {
        return false;
    }
}

export class CustomDB {
    readonly name: string;
    readonly version: number;
    readonly tableList: TableConfig[];
    readonly itemDuration?: MiliSeconds;
    constructor(dbConfig: DBConfig) {
        dbEnvChecker();
        customDBConfigChecker(dbConfig);
        this.name = dbConfig.dbName;
        this.version = optionWithBackup(dbConfig.dbVersion, DEFAULT_DB_VERSION);
        this.tableList = Object.keys(dbConfig.tables || {}).map(tableName => {
            return {
                tableName,
                ...dbConfig.tables![tableName]
            };
        });
        this.itemDuration = dbConfig.itemDuration;
    }
    async addItems(itemConfigs: ItemConfig[]) {
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
        customDBAddItemsParamChecker(itemConfigs, this.tableList);
        // Set backup itemDuration to each item
        const itemsWithDuration = itemConfigs.map(itemConfig => {
            const theTable: TableConfig = this.tableList.filter(
                table => table.tableName === itemConfig.tableName
            )[0] ;
            return {
                itemDuration: itemDurationOverrider(
                    this.itemDuration,
                    theTable.itemDuration,
                    itemConfig.itemDuration
                ),
                ...itemConfig
            };
        });
        await DBWrapper.addItems(
            {
                name: this.name,
                tableList: this.tableList,
                version: this.version
            },
            itemsWithDuration
        );
    }
    async getItem(tableName: string, primaryKeyValue: any) {
        return await getItemFromDB(this.name, tableName, primaryKeyValue);
    }

    async getItemsInRange(tableIndexRange: TableIndexRange) {
        return await getItemsInRangeFromDB(this.name, tableIndexRange);
    }

    async deleteItemsInRange(tableIndexRanges: TableIndexRange[]) {
        paramChecker(
            tableIndexRanges,
            ParamCheckerEnum.Array,
            'tableIndexRanges',
            !OPTIONAL
        );
        tableIndexRanges.forEach(tableIndexRange => {
            tableIndexRangeParamChecker(tableIndexRange);
        });
        await DBWrapper.deleteItems(this.name, tableIndexRanges);
    }
}

export async function deleteDB(dbName: string) {
    dbEnvChecker();
    paramChecker(dbName, ParamCheckerEnum.String, 'dbName', !OPTIONAL);
    await DBWrapper.deleteDB(dbName);
}

export async function getItemFromDB(
    dbName: string,
    tableName: string,
    primaryKeyValue: any
) {
    paramChecker(dbName, ParamCheckerEnum.String, 'dbName', !OPTIONAL);
    paramChecker(tableName, ParamCheckerEnum.String, 'tableName', !OPTIONAL);
    return await DBWrapper.getItem(dbName, tableName, primaryKeyValue);
}

export async function getItemsInRangeFromDB(
    dbName: string,
    tableIndexRange: TableIndexRange
) {
    paramChecker(dbName, ParamCheckerEnum.String, 'dbName', !OPTIONAL);
    tableIndexRangeParamChecker(tableIndexRange);
    return await DBWrapper.getItemsInRange(dbName, tableIndexRange);
}

export default {
    idbIsSupported,
    CustomDB,
    deleteDB,
    getItemFromDB,
    getItemsInRangeFromDB
};
