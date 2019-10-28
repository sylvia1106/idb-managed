"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
exports.ParamCheckerEnum = {
    NonNegativeInteger: {
        rule: isNonNegativeInteger,
        desc: 'needs to be a non-negative integer'
    },
    NotNullObject: {
        rule: function (param) {
            return param && typeof param === 'object';
        },
        desc: 'needs to be a not-null object'
    },
    String: {
        rule: function (param) {
            return typeof param === 'string';
        },
        desc: 'needs to be a string'
    },
    Array: {
        rule: function (param) {
            return param instanceof Array;
        },
        desc: 'needs to be an Array'
    },
    Boolean: {
        rule: function (param) {
            return typeof param === 'boolean';
        },
        desc: 'needs to be a boolean'
    }
};
function isNonNegativeInteger(x) {
    return !isNaN(x) && x >= 0;
}
exports.isNonNegativeInteger = isNonNegativeInteger;
function optionWithBackup(param, backup) {
    return param !== undefined ? param : backup;
}
exports.optionWithBackup = optionWithBackup;
function paramChecker(param, checker, paramName, optional) {
    var exp = paramName + " " + checker.desc;
    if (optional) {
        if (param !== undefined && !checker.rule(param)) {
            throw exp + " if defined";
        }
    }
    else {
        if (!checker.rule(param)) {
            throw "" + exp;
        }
    }
}
exports.paramChecker = paramChecker;
function deduplicateList(list) {
    var deduplicatedList = list.reduce(function (accumulator, currentItem) {
        if (accumulator.indexOf(currentItem) < 0) {
            return accumulator.concat(currentItem);
        }
        else {
            return accumulator;
        }
    }, []);
    return deduplicatedList;
}
exports.deduplicateList = deduplicateList;
