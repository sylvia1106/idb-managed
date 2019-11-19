import { ItemConfig, TableConfig, TableIndexRange } from './interface';
interface DB {
    name: string;
    tableList: TableConfig[];
    version: number;
}
export declare function addItems(dbInfo: DB, items: ItemConfig[]): Promise<void>;
export declare function getItem(dbName: string, tableName: string, primaryKeyValue: any): Promise<any>;
export declare function getItemsInRange(dbName: string, tableIndexRange: TableIndexRange): Promise<any[]>;
export declare function deleteDB(dbName: string): Promise<void>;
export declare function deleteItems(dbName: string, tableIndexRanges: TableIndexRange[]): Promise<void>;
declare const _default: {
    addItems: typeof addItems;
    getItem: typeof getItem;
    getItemsInRange: typeof getItemsInRange;
    deleteDB: typeof deleteDB;
    deleteItems: typeof deleteItems;
};
export default _default;
