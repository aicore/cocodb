import {getCreatTableSchema} from "../api/createTable.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.createTable, getCreatTableSchema().schema);

/* Getting a document from the database. */
export async function createTable(request) {
    const response = {
        isSuccess: false
    };
    const tableName = request.tableName;
    try {
        response.isSuccess = await LibMySql.createTable(tableName);
    } catch (e) {
        console.error(e);
        response.errorMessage = e.toString();
    }
    return response;
}

