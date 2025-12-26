import {getDeleteKeySchema} from "../api/deleteKey.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.deleteDocument, getDeleteKeySchema().schema);

/* Getting a document from the database. */
export async function deleteDocument(request, logger = console) {
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
        logger.error({
            err: e,
            tableName,
            documentId,
            operation: 'deleteDocument'
        }, 'Error in deleteDocument operation');
        response.errorMessage = e.toString();
    }
    return response;
}

