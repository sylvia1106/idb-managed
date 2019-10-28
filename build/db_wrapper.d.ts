/**
 * @file Wrap idb APIs for idb-managed
 */
import { CustomDB } from './index';
import { ItemConfig, ItemInTable, TableIndexRange } from './interface';
export declare function addItems(customDB: CustomDB, items: ItemConfig[]): Promise<void>;
export declare function getItem(dbName: string, tableName: string, primaryKeyValue: any): Promise<ItemInTable | null>;
export declare function getItemsInRange(dbName: string, tableIndexRange: TableIndexRange): Promise<(ItemInTable | null)[]>;
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
