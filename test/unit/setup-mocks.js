//import mysql from "mysql2";

import LibMySql from "@aicore/libmysql";

let setupDone = false;

let mockedFunctions = {
    createTable: function (tableName) {
        return new Promise(resolve => {
            resolve(true);
        });

    },
    createDataBase: function (tableName) {
        return new Promise(resolve => {
            resolve(true);
        });

    },
    deleteDataBase: function (tableName) {
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
    },
    getFromNonIndex: function (tableName, queryObject) {
        return new Promise(resolve => {
            resolve([{1: '2'}]);
        });
    },
    get: function (tableName, documentId) {
        return new Promise(resolve => {
            resolve({
                hello: 'world'
            });
        });
    },
    getFromIndex: function (tableName, queryObject) {
        return new Promise(resolve => {
            resolve([{1: '2'}]);
        });
    },
    mathAdd: function (tableName, documentId, fieldsToIncrementMap) {
        return new Promise(resolve => {
            resolve(true);
        });

    },
    listDatabases: function () {
        return new Promise(resolve => {
            resolve(['test', 'mysql', 'information_schema']);
        });
    },
    listTables: function (databaseName) {
        return new Promise(resolve => {
            resolve(['customers', 'orders']);
        });
    },
    getTableIndexes: function (tableName) {
        return new Promise(resolve => {
            resolve([{
                indexName: 'PRIMARY',
                columnName: 'documentID',
                jsonField: null,
                isUnique: true,
                isPrimary: true,
                sequenceInIndex: 1,
                indexType: 'BTREE',
                isNullable: false
            }]);
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
    LibMySql.getFromNonIndex = mockedFunctions.getFromNonIndex;
    LibMySql.get = mockedFunctions.get;
    LibMySql.getFromIndex = mockedFunctions.getFromIndex;
    LibMySql.createDataBase = mockedFunctions.createDataBase;
    LibMySql.deleteDataBase = mockedFunctions.deleteDataBase;
    LibMySql.mathAdd = mockedFunctions.mathAdd;
    LibMySql.listDatabases = mockedFunctions.listDatabases;
    LibMySql.listTables = mockedFunctions.listTables;
    LibMySql.getTableIndexes = mockedFunctions.getTableIndexes;
    setupDone = true;
}

_setup();

export default mockedFunctions;
