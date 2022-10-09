import {getFromIndexSchema} from "../api/getFromIndex.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.getFromIndex, getFromIndexSchema().schema);

/* Getting a document from the database. */
export async function getFromIndex(request) {
    const response = {
        isSuccess: false
    };
    const tableName = request.tableName;
    const queryObject = request.queryObject;
    try {
        const documents = await LibMySql.getFromIndex(tableName, queryObject);
        response.isSuccess = true;
        response.documents = documents;

    } catch (e) {
        console.error(e);
        response.errorMessage = e.toString();
    }
    return response;
}

