import { DBConfig, ItemConfig, TableConfig, TableIndexRange, MiliSeconds } from './interface';
export * from './interface';
export declare function idbIsSupported(): boolean;
export declare class CustomDB {
    readonly name: string;
    readonly version: number;
    readonly tableList: TableConfig[];
    readonly itemDuration?: MiliSeconds;
    constructor(dbConfig: DBConfig);
    addItems(items: ItemConfig[]): Promise<import("./lib/formatted_result").ResultFormatter>;
    getItem(tableName: string, primaryKeyValue: any): Promise<import("./interface").ItemInTable | null>;
    getItemsInRange(tableIndexRange: TableIndexRange): Promise<(import("./interface").ItemInTable | null)[]>;
    deleteItemsInRange(tableIndexRanges: TableIndexRange[]): Promise<import("./lib/formatted_result").ResultFormatter>;
}
export declare function deleteDB(dbName: string): Promise<import("./lib/formatted_result").ResultFormatter>;
declare const _default: {
    idbIsSupported: typeof idbIsSupported;
    CustomDB: typeof CustomDB;
    deleteDB: typeof deleteDB;
};
export default _default;
