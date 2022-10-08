import {getCreatTableSchema} from "../api/createTable.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema, VALIDATE, validate} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.createTable, getCreatTableSchema().schema);

/* Getting a document from the database. */
export async function createTable(request) {
    const response = {
        isSuccess: false
    };
    if (!validate(COCO_DB_FUNCTIONS.createTable, request, VALIDATE.REQUEST)) {
        response.errorMessage = 'request Validation Failed';
        return response;
    }
    const tableName = request.tableName;
    try {
        const isSuccess = await LibMySql.createTable(tableName);
        response.isSuccess = isSuccess;
        if (!validate(COCO_DB_FUNCTIONS.createTable, response, VALIDATE.RESPONSE_SUCCESS)) {
            response.isSuccess = false;
            response.errorMessage = 'Unable to get valid data from DB';
        }
        return response;

    } catch (e) {
        console.error(e);
        response.errorMessage = e.toString();
        if (!validate(COCO_DB_FUNCTIONS.createTable, response, VALIDATE.RESPONSE_FAIL)) {
            response.errorMessage = response.errorMessage + " unable to validate the response schema";
        }
        return response;
    }
}

