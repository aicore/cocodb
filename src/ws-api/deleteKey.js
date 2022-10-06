import {getDeleteKeySchema} from "../api/deleteKey.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema, VALIDATE, validate} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.delet, getDeleteKeySchema().schema);

/* Getting a document from the database. */
export async function deleteDocument(request) {
    const response = {
        isSuccess: false
    };
    if (!validate(COCO_DB_FUNCTIONS.deleteDocument, request, VALIDATE.REQUEST)) {
        response.errorMessage = 'request Validation Failed';
        return response;
    }
    const databaseName = request.databaseName;
    const documentId = request.documentId;
    try {
        const isSuccess = await LibMySql.deleteKey(databaseName, documentId);
        response.isSuccess = isSuccess;
        if (!validate(COCO_DB_FUNCTIONS.deleteDocument, response, VALIDATE.RESPONSE_SUCCESS)) {
            response.isSuccess = false;
            response.errorMessage = 'Unable to get valid data from DB';
        }
        return response;

    } catch (e) {
        response.errorMessage = e.toString();
        if (!validate(COCO_DB_FUNCTIONS.deleteDocument, response, VALIDATE.RESPONSE_FAIL)) {
            response.errorMessage = response.errorMessage + " unable to validate the response schema";
        }
        return response;
    }
}

