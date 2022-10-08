import {getUpdateSchema} from "../api/update.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema, VALIDATE, validate} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.update, getUpdateSchema().schema);

/* Getting a document from the database. */
export async function update(request) {
    const response = {
        isSuccess: false
    };
    if (!validate(COCO_DB_FUNCTIONS.update, request, VALIDATE.REQUEST)) {
        response.errorMessage = 'request Validation Failed';
        return response;
    }
    const tableName = request.tableName;
    const documentId = request.documentId;
    const document = request.document;
    try {
        const modifiedDocumentId = await LibMySql.update(tableName, documentId, document);
        response.isSuccess = true;
        response.documentId = modifiedDocumentId;
        if (!validate(COCO_DB_FUNCTIONS.update, response, VALIDATE.RESPONSE_SUCCESS)) {
            response.isSuccess = false;
            response.errorMessage = 'Unable to get valid data from DB';
        }
        return response;

    } catch (e) {
        console.error(e);
        response.errorMessage = e.toString();
        if (!validate(COCO_DB_FUNCTIONS.update, response, VALIDATE.RESPONSE_FAIL)) {
            response.errorMessage = response.errorMessage + " unable to validate the response schema";
        }
        return response;
    }
}

