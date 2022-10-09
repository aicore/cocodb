import {getPutSchema} from "../api/put.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.put, getPutSchema().schema);

/* Getting a document from the database. */
export async function put(request) {
    const response = {
        isSuccess: false
    };

    const tableName = request.tableName;
    const document = request.document;
    try {
        const documentId = await LibMySql.put(tableName, document);
        response.isSuccess = true;
        response.documentId = documentId;

    } catch (e) {
        console.error(e);
        response.errorMessage = e.toString();
    }
    return response;
}

