import {getDeleteTableSchema} from "../api/deleteTable.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema, VALIDATE, validate} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.createTable, getDeleteTableSchema().schema);


export async function deleteTable(request) {
    const response = {
        isSuccess: false
    };
    if (!validate(COCO_DB_FUNCTIONS.deleteTable, request, VALIDATE.REQUEST)) {
        response.errorMessage = 'request Validation Failed';
        return response;
    }
    const tableName = request.tableName;
    try {
        const isSuccess = await LibMySql.deleteTable(tableName);
        response.isSuccess = isSuccess;
        if (!validate(COCO_DB_FUNCTIONS.deleteTable, response, VALIDATE.RESPONSE_SUCCESS)) {
            response.isSuccess = false;
            response.errorMessage = 'Unable to get valid data from DB';
        }
        return response;

    } catch (e) {
        request.log.error(e);
        response.errorMessage = e.toString();
        if (!validate(COCO_DB_FUNCTIONS.deleteTable, response, VALIDATE.RESPONSE_FAIL)) {
            response.errorMessage = response.errorMessage + " unable to validate the response schema";
        }
        return response;
    }
}

