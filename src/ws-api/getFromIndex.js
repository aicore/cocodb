import {getFromIndexSchema} from "../api/getFromIndex.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema, VALIDATE, validate} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.getFromIndex, getFromIndexSchema().schema);

/* Getting a document from the database. */
export async function getFromIndex(request) {
    const response = {
        isSuccess: false
    };
    if (!validate(COCO_DB_FUNCTIONS.getFromIndex, request, VALIDATE.REQUEST)) {
        response.errorMessage = 'request Validation Failed';
        return response;
    }
    const tableName = request.tableName;
    const queryObject = request.queryObject;
    try {
        const documents = await LibMySql.getFromIndex(tableName, queryObject);
        response.isSuccess = true;
        response.documents = documents;
        if (!validate(COCO_DB_FUNCTIONS.getFromIndex, response, VALIDATE.RESPONSE_SUCCESS)) {
            response.isSuccess = false;
            response.errorMessage = 'Unable to get valid data from DB';
        }
        return response;

    } catch (e) {
        console.error(e);
        response.errorMessage = e.toString();
        if (!validate(COCO_DB_FUNCTIONS.createIndex, response, VALIDATE.RESPONSE_FAIL)) {
            response.errorMessage = response.errorMessage + " unable to validate the response schema";
        }
        return response;
    }
}

