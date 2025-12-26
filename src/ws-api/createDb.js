import {getCreateDbSchema} from "../api/createDb.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.createDb, getCreateDbSchema().schema);

export async function createDb(request, logger = console) {
    const response = {
        isSuccess: false
    };
    const databaseName = request.databaseName;
    try {
        response.isSuccess = await LibMySql.createDataBase(databaseName);
    } catch (e) {
        logger.error({
            err: e,
            databaseName,
            operation: 'createDb'
        }, 'Error in createDb operation');
        response.errorMessage = e.toString();
    }
    return response;
}

