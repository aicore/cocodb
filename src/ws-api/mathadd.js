import {getMathAddSchema} from "../api/mathadd.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema, VALIDATE, validate} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.mathAdd, getMathAddSchema().schema);

/* Getting a document from the database. */
export async function mathAdd(request) {
    const response = {
        isSuccess: false
    };
    if (!validate(COCO_DB_FUNCTIONS.mathAdd, request, VALIDATE.REQUEST)) {
        response.errorMessage = 'request Validation Failed';
        return response;
    }
    const tableName = request.tableName;
    const documentId = request.documentId;
    const jsonFieldsIncrements = request.jsonFieldsIncrements;
    try {
        const isSuccess = await LibMySql.mathAdd(tableName, documentId, jsonFieldsIncrements);
        response.isSuccess = isSuccess;
        if (!validate(COCO_DB_FUNCTIONS.mathAdd, response, VALIDATE.RESPONSE_SUCCESS)) {
            response.isSuccess = false;
            response.errorMessage = 'Unable to get valid data from DB';
        }
        return response;

    } catch (e) {
        request.log.error(e);
        response.errorMessage = e.toString();
        if (!validate(COCO_DB_FUNCTIONS.mathAdd, response, VALIDATE.RESPONSE_FAIL)) {
            response.errorMessage = response.errorMessage + " unable to validate the response schema";
        }
        return response;
    }
}

