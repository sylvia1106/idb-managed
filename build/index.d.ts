import { DBConfig, ItemConfig, TableConfig, TableIndexRange, MiliSeconds } from './interface';
export * from './interface';
export declare function idbIsSupported(): boolean;
export declare class CustomDB {
    readonly name: string;
    readonly version: number;
    readonly tableList: TableConfig[];
    readonly itemDuration?: MiliSeconds;
    constructor(dbConfig: DBConfig);
    addItems(itemConfigs: ItemConfig[]): Promise<void>;
    getItem(tableName: string, primaryKeyValue: any): Promise<any>;
    getItemsInRange(tableIndexRange: TableIndexRange): Promise<any[]>;
    deleteItemsInRange(tableIndexRanges: TableIndexRange[]): Promise<void>;
}
export declare function deleteDB(dbName: string): Promise<void>;
export declare function getItemFromDB(dbName: string, tableName: string, primaryKeyValue: any): Promise<any>;
export declare function getItemsInRangeFromDB(dbName: string, tableIndexRange: TableIndexRange): Promise<any[]>;
declare const _default: {
    idbIsSupported: typeof idbIsSupported;
    CustomDB: typeof CustomDB;
    deleteDB: typeof deleteDB;
    getItemFromDB: typeof getItemFromDB;
    getItemsInRangeFromDB: typeof getItemsInRangeFromDB;
};
export default _default;
