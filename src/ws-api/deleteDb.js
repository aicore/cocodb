import {getDeleteDBSchema} from "../api/deleteDb.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema, VALIDATE, validate} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.deleteDb, getDeleteDBSchema().schema);

/* Getting a document from the database. */
export async function deleteDb(request) {
    const response = {
        isSuccess: false
    };
    if (!validate(COCO_DB_FUNCTIONS.deleteDb, request, VALIDATE.REQUEST)) {
        response.errorMessage = 'request Validation Failed';
        return response;
    }
    const databaseName = request.databaseName;
    try {
        const isSuccess = await LibMySql.deleteDataBase(databaseName);
        response.isSuccess = isSuccess;
        if (!validate(COCO_DB_FUNCTIONS.deleteDb, response, VALIDATE.RESPONSE_SUCCESS)) {
            response.isSuccess = false;
            response.errorMessage = 'Unable to get valid data from DB';
        }
        return response;

    } catch (e) {
        request.log.error(e);
        response.errorMessage = e.toString();
        if (!validate(COCO_DB_FUNCTIONS.deleteDb, response, VALIDATE.RESPONSE_FAIL)) {
            response.errorMessage = response.errorMessage + " unable to validate the response schema";
        }
        return response;
    }
}

