import {getCreateIndexSchema} from "../api/createIndex.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.createIndex, getCreateIndexSchema().schema);

/* Getting a document from the database. */
export async function createIndex(request) {
    const response = {
        isSuccess: false
    };

    const tableName = request.tableName;
    const jsonField = request.jsonField;
    const dataType = request.dataType;
    const isUnique = (request.isUnique) ? request.isUnique : false;
    const isNotNull = (request.isNotNull) ? request.isNotNull : false;
    try {
        response.isSuccess = await LibMySql.createIndexForJsonField(tableName, jsonField, dataType, isUnique, isNotNull);
    } catch (e) {
        console.error(e);
        response.errorMessage = e.toString();
    }
    return response;
}

