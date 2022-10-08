import {getPutSchema} from "../api/put.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema, VALIDATOR, validate} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.put, getPutSchema().schema);

/* Getting a document from the database. */
export async function put(request) {
    const response = {
        isSuccess: false
    };
    if (!validate(COCO_DB_FUNCTIONS.put, request, VALIDATOR.REQUEST)) {
        response.errorMessage = 'request Validation Failed';
        return response;
    }
    const tableName = request.tableName;
    const document = request.document;
    try {
        const documentId = await LibMySql.put(tableName, document);
        response.isSuccess = true;
        response.documentId = documentId;
        if (!validate(COCO_DB_FUNCTIONS.put, response, VALIDATOR.RESPONSE_SUCCESS)) {
            response.isSuccess = false;
            response.errorMessage = 'Unable to get valid data from DB';
        }
        return response;

    } catch (e) {
        console.error(e);
        response.errorMessage = e.toString();
        if (!validate(COCO_DB_FUNCTIONS.put, response, VALIDATOR.RESPONSE_FAIL)) {
            response.errorMessage = response.errorMessage + " unable to validate the response schema";
        }
        return response;
    }
}

