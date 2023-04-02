import {getDeleteDocumentsSchema} from "../api/deleteDocuments.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.deleteDocuments, getDeleteDocumentsSchema().schema);

/* Getting a document from the database. */
export async function deleteDocuments(request) {
    const response = {
        isSuccess: false
    };
    const tableName = request.tableName;
    const queryString = request.queryString;
    const useIndexForFields = request.useIndexForFields;
    try {
        response.deleteCount = await LibMySql.deleteDocuments(tableName, queryString, useIndexForFields);
        response.isSuccess = true;

    } catch (e) {
        response.errorMessage = e.toString();
    }
    return response;
}

