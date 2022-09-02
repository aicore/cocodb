//import mysql from "mysql2";

import LibMySql from "@aicore/libmysql";

let setupDone = false;

let mockedFunctions = {
    createTable: function (tableName) {
        return new Promise(resolve => {
            resolve(true);
        });

    }
};

function _setup() {
    if (setupDone) {
        return;
    }

    LibMySql.createTable = mockedFunctions.createTable;
    setupDone = true;
}

_setup();

export default mockedFunctions;
