import {getDeleteDBSchema} from "../api/deleteDb.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.deleteDb, getDeleteDBSchema().schema);

/* Getting a document from the database. */
export async function deleteDb(request) {
    const response = {
        isSuccess: false
    };
    const databaseName = request.databaseName;
    try {
        response.isSuccess = await LibMySql.deleteDataBase(databaseName);
    } catch (e) {
        console.error(e);
        response.errorMessage = e.toString();
    }
    return response;
}

