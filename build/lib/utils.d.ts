interface ParamChecker {
    rule: Function;
    desc: string;
}
export declare const ParamCheckerEnum: {
    NonNegativeInteger: {
        rule: typeof isNonNegativeInteger;
        desc: string;
    };
    NotNullObject: {
        rule: (param: any) => boolean;
        desc: string;
    };
    String: {
        rule: (param: any) => boolean;
        desc: string;
    };
    Array: {
        rule: (param: any) => boolean;
        desc: string;
    };
    Boolean: {
        rule: (param: any) => boolean;
        desc: string;
    };
};
export declare function isNonNegativeInteger(x: any): boolean;
export declare function optionWithBackup(param: any, backup: any): any;
export declare function paramChecker(param: any, checker: ParamChecker, paramName: string, optional: boolean): void;
export {};
