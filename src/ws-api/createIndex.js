import {getCreateIndexSchema} from "../api/createIndex.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema, VALIDATOR, validate} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.createIndex, getCreateIndexSchema().schema);

/* Getting a document from the database. */
export async function createIndex(request) {
    const response = {
        isSuccess: false
    };
    if (!validate(COCO_DB_FUNCTIONS.createIndex, request, VALIDATOR.REQUEST)) {
        response.errorMessage = 'request Validation Failed';
        return response;
    }
    const tableName = request.tableName;
    const jsonField = request.jsonField;
    const dataType = request.dataType;
    const isUnique = (request.isUnique) ? request.isUnique : false;
    const isNotNull = (request.isNotNull) ? request.isNotNull : false;
    try {

        if (!validate(COCO_DB_FUNCTIONS.createIndex, response, VALIDATOR.RESPONSE_SUCCESS)) {
            response.isSuccess = false;
            response.errorMessage = 'Unable to get valid data from DB';
            return response;
        }
        response.isSuccess = await LibMySql.createIndexForJsonField(tableName, jsonField, dataType, isUnique, isNotNull);


    } catch (e) {
        console.error(e);
        response.errorMessage = e.toString();
        if (!validate(COCO_DB_FUNCTIONS.createIndex, response, VALIDATOR.RESPONSE_FAIL)) {
            response.errorMessage = response.errorMessage + " unable to validate the response schema";
        }
    }
    return response;
}

