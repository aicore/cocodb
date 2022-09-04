//import mysql from "mysql2";

import LibMySql from "@aicore/libmysql";

let setupDone = false;

let mockedFunctions = {
    createTable: function (tableName) {
        return new Promise(resolve => {
            resolve(true);
        });

    },
    put: function (tableName, document) {
        return new Promise(resolve => {
            return resolve('12345');
        });
    },
    deleteKey: function (tableName, documentId) {
        return new Promise(resolve => {
            resolve(true);
        });

    },
    deleteTable: function (tableName) {
        return new Promise(resolve => {
            resolve(true);

        });
    },
    createIndexForJsonField: function (tableName, jsonfield, datatype, isUnique, isNull) {
        return new Promise(resolve => {
            resolve(true);
        });

    },
    update: function (tableName, documentId, document) {
        return new Promise(resolve => {
            resolve(documentId);
        });
    }
};

function _setup() {
    if (setupDone) {
        return;
    }

    LibMySql.createTable = mockedFunctions.createTable;
    LibMySql.put = mockedFunctions.put;
    LibMySql.deleteKey = mockedFunctions.deleteKey;
    LibMySql.deleteTable = mockedFunctions.deleteTable;
    LibMySql.createIndexForJsonField = mockedFunctions.createIndexForJsonField;
    LibMySql.update = mockedFunctions.update;
    setupDone = true;
}

_setup();

export default mockedFunctions;
