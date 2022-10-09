import {getDeleteTableSchema} from "../api/deleteTable.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.deleteTable, getDeleteTableSchema().schema);


export async function deleteTable(request) {
    const response = {
        isSuccess: false
    };
    const tableName = request.tableName;
    try {
        response.isSuccess = await LibMySql.deleteTable(tableName);

    } catch (e) {
        console.error(e);
        response.errorMessage = e.toString();
    }
    return response;
}

