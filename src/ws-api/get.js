import {getSchema} from "../api/get.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.get, getSchema().schema);

/* Getting a document from the database. */
export async function get(request, logger = console) {
    const response = {
        isSuccess: false
    };
    const tableName = request.tableName;
    const documentId = request.documentId;
    try {
        const document = await LibMySql.get(tableName, documentId);
        response.isSuccess = true;
        response.document = document;

    } catch (e) {
        logger.error({
            err: e,
            tableName,
            documentId,
            operation: 'get'
        }, 'Error in get operation');
        response.errorMessage = e.toString();
    }
    return response;
}

