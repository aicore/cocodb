import {getDeleteKeySchema} from "../api/deleteKey.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.deleteDocument, getDeleteKeySchema().schema);

/* Getting a document from the database. */
export async function deleteDocument(request) {
    const response = {
        isSuccess: false
    };
    const tableName = request.tableName;
    const documentId = request.documentId;
    const condition = request.condition;
    try {
        const isSuccess = await LibMySql.deleteKey(tableName, documentId, condition);
        response.isSuccess = isSuccess;

    } catch (e) {
        response.errorMessage = e.toString();
    }
    return response;
}

