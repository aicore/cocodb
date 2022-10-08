import {getFromNonIndexSchema} from "../api/getFromNonIndex.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema, VALIDATOR, validate} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.getFromNonIndex, getFromNonIndexSchema().schema);

/* Getting a document from the database. */
export async function getFromNonIndex(request) {
    const response = {
        isSuccess: false
    };
    if (!validate(COCO_DB_FUNCTIONS.getFromNonIndex, request, VALIDATOR.REQUEST)) {
        response.errorMessage = 'request Validation Failed';
        return response;
    }
    const tableName = request.tableName;
    const queryObject = request.queryObject;
    try {
        const documents = await LibMySql.getFromNonIndex(tableName, queryObject);
        response.isSuccess = true;
        response.documents = documents;
        if (!validate(COCO_DB_FUNCTIONS.getFromNonIndex, response, VALIDATOR.RESPONSE_SUCCESS)) {
            response.isSuccess = false;
            response.errorMessage = 'Unable to get valid data from DB';
        }
        return response;

    } catch (e) {
        console.error(e);
        response.errorMessage = e.toString();
        if (!validate(COCO_DB_FUNCTIONS.getFromNonIndex, response, VALIDATOR.RESPONSE_FAIL)) {
            response.errorMessage = response.errorMessage + " unable to validate the response schema";
        }
        return response;
    }
}

