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
    getItem(tableName: string, primaryKeyValue: any): Promise<import("./interface").ItemInTable | null>;
    getItemsInRange(tableIndexRange: TableIndexRange): Promise<any[]>;
    deleteItemsInRange(tableIndexRanges: TableIndexRange[]): Promise<void>;
}
export declare function deleteDB(dbName: string): Promise<void>;
declare const _default: {
    idbIsSupported: typeof idbIsSupported;
    CustomDB: typeof CustomDB;
    deleteDB: typeof deleteDB;
};
export default _default;
