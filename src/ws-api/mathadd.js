import {getMathAddSchema} from "../api/mathadd.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.mathAdd, getMathAddSchema().schema);

/* Getting a document from the database. */
export async function mathAdd(request) {
    const response = {
        isSuccess: false
    };
    const tableName = request.tableName;
    const documentId = request.documentId;
    const jsonFieldsIncrements = request.jsonFieldsIncrements;
    const condition = request.condition;
    try {
        response.isSuccess = await LibMySql.mathAdd(tableName, documentId, jsonFieldsIncrements, condition);
    } catch (e) {
        console.error(e);
        response.errorMessage = e.toString();

    }
    return response;
}

