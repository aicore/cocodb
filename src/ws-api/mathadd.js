import {getMathAddSchema} from "../api/mathadd.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema, VALIDATOR, validate} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.mathAdd, getMathAddSchema().schema);

/* Getting a document from the database. */
export async function mathAdd(request) {
    const response = {
        isSuccess: false
    };
    if (!validate(COCO_DB_FUNCTIONS.mathAdd, request, VALIDATOR.REQUEST)) {
        response.errorMessage = 'request Validation Failed';
        return response;
    }
    const tableName = request.tableName;
    const documentId = request.documentId;
    const jsonFieldsIncrements = request.jsonFieldsIncrements;
    try {
        response.isSuccess = await LibMySql.mathAdd(tableName, documentId, jsonFieldsIncrements);
        if (!validate(COCO_DB_FUNCTIONS.mathAdd, response, VALIDATOR.RESPONSE_SUCCESS)) {
            response.isSuccess = false;
            response.errorMessage = 'Unable to get valid data from DB';
        }
        return response;

    } catch (e) {
        console.error(e);
        response.errorMessage = e.toString();
        if (!validate(COCO_DB_FUNCTIONS.mathAdd, response, VALIDATOR.RESPONSE_FAIL)) {
            response.errorMessage = response.errorMessage + " unable to validate the response schema";
        }
        return response;
    }
}

