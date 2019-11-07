interface ParamChecker {
    rule: Function;
    desc: string;
};
export const ParamCheckerEnum = {
    NonNegativeInteger: {
        rule: isNonNegativeInteger,
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
export function isNonNegativeInteger(x: any) {
    return !isNaN(x) && x >= 0;
}
export function optionWithBackup(param: any, backup: any) {
    return param !== undefined ? param : backup;
}
export function paramChecker(
    param: any,
    checker: ParamChecker,
    paramName: string,
    optional: boolean
): void {
    const exp = `${paramName} ${checker.desc}`;
    if (optional) {
        if (param !== undefined && !checker.rule(param)) {
            throw new Error(`${exp} if defined`);
        }
    } else {
        if (!checker.rule(param)) {
            throw new Error(exp);
        }
    }
}
export function deduplicateList(list: any[]) {
    let deduplicatedList = list.reduce((accumulator, currentItem) => {
        if (accumulator.indexOf(currentItem) < 0) {
            return accumulator.concat(currentItem)
        } else {
            return accumulator
        }
    }, [])
    return deduplicatedList
}