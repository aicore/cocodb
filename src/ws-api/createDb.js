import {getCreateDbSchema} from "../api/createdb.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema, VALIDATOR, validate} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.createDb, getCreateDbSchema().schema);

/* Getting a document from the database. */
export async function createDb(request) {
    const response = {
        isSuccess: false
    };
    if (!validate(COCO_DB_FUNCTIONS.createDb, request, VALIDATOR.REQUEST)) {
        response.errorMessage = 'request Validation Failed';
        return response;
    }
    const databaseName = request.databaseName;
    try {
        response.isSuccess =  await LibMySql.createDataBase(databaseName);
        if (!validate(COCO_DB_FUNCTIONS.createDb, response, VALIDATOR.RESPONSE_SUCCESS)) {
            response.isSuccess = false;
            response.errorMessage = 'Unable to get valid data from DB';
        }
        return response;

    } catch (e) {
        response.errorMessage = e.toString();
        if (!validate(COCO_DB_FUNCTIONS.createDb, response, VALIDATOR.RESPONSE_FAIL)) {
            response.errorMessage = response.errorMessage + " unable to validate the response schema";
        }
        return response;
    }
}

