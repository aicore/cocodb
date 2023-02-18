import {getQuerySchema} from "../api/query.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.query, getQuerySchema().schema);

/* Getting a document from the database. */
export async function query(request) {
    const response = {
        isSuccess: false
    };
    const tableName = request.tableName;
    const queryString = request.queryString;
    const useIndexForFields = request.useIndexForFields;
    const options = request.options;
    try {
        const documents = await LibMySql.query(tableName, queryString, useIndexForFields, options);
        response.isSuccess = true;
        response.documents = documents;

    } catch (e) {
        console.error(e);
        response.errorMessage = e.toString();

    }
    return response;
}

