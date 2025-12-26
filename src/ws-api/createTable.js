import {getCreatTableSchema} from "../api/createTable.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.createTable, getCreatTableSchema().schema);

/* Getting a document from the database. */
export async function createTable(request, logger = console) {
    const response = {
        isSuccess: false
    };
    const tableName = request.tableName;
    try {
        response.isSuccess = await LibMySql.createTable(tableName);
    } catch (e) {
        logger.error({
            err: e,
            tableName,
            operation: 'createTable'
        }, 'Error in createTable operation');
        response.errorMessage = e.toString();
    }
    return response;
}

