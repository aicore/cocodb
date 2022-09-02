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
            }
        );
    }
};

function _setup() {
    if (setupDone) {
        return;
    }

    LibMySql.createTable = mockedFunctions.createTable;
    LibMySql.put = mockedFunctions.put;
    setupDone = true;
}

_setup();

export default mockedFunctions;
