import {getDeleteTableSchema} from "../api/deleteTable.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.deleteTable, getDeleteTableSchema().schema);


export async function deleteTable(request, logger = console) {
    const response = {
        isSuccess: false
    };
    const tableName = request.tableName;
    try {
        response.isSuccess = await LibMySql.deleteTable(tableName);

    } catch (e) {
        logger.error({
            err: e,
            tableName,
            operation: 'deleteTable'
        }, 'Error in deleteTable operation');
        response.errorMessage = e.toString();
    }
    return response;
}

