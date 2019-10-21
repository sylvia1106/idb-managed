interface DB {
    name: string,
    tableList: TableConfig[],
    version: number
}
type DBConfig = {
    dbName: string;
    tables?: {
        [key: string]: TableConfig
    };
    dbVersion?: number;
    itemDuration?: MiliSeconds;
};
type TableConfig = {
    tableName?: string;
    primaryKey?: string;
    indexList?: IndexOfTable[];
    itemDuration?: MiliSeconds;
};
type IndexOfTable = {
    indexName: string;
    unique?: boolean;
};
type ItemInTable = {
    tableName: string;
    item: any;
    itemDuration?: MiliSeconds;
};
type IndexRange = {
    indexName: string,
    onlyIndex?: any,
    lowerIndex?: any,
    upperIndex?: any,
    lowerExclusive?: boolean,
    upperExclusive?: boolean
}
type MiliSeconds = number;
type ParamChecker = {
    rule: Function,
    desc: string
}
