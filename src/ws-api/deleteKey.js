import {getDeleteKeySchema} from "../api/deleteKey.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema, VALIDATOR, validate} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.deleteDocument, getDeleteKeySchema().schema);

/* Getting a document from the database. */
export async function deleteDocument(request) {
    const response = {
        isSuccess: false
    };
    if (!validate(COCO_DB_FUNCTIONS.deleteDocument, request, VALIDATOR.REQUEST)) {
        response.errorMessage = 'request Validation Failed';
        return response;
    }
    const tableName = request.tableName;
    const documentId = request.documentId;
    try {
        const isSuccess = await LibMySql.deleteKey(tableName, documentId);
        response.isSuccess = isSuccess;
        if (!validate(COCO_DB_FUNCTIONS.deleteDocument, response, VALIDATOR.RESPONSE_SUCCESS)) {
            response.isSuccess = false;
            response.errorMessage = 'Unable to get valid data from DB';
        }
        return response;

    } catch (e) {
        response.errorMessage = e.toString();
        if (!validate(COCO_DB_FUNCTIONS.deleteDocument, response, VALIDATOR.RESPONSE_FAIL)) {
            response.errorMessage = response.errorMessage + " unable to validate the response schema";
        }
        return response;
    }
}

