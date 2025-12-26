import {getFromNonIndexSchema} from "../api/getFromNonIndex.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.getFromNonIndex, getFromNonIndexSchema().schema);

/* Getting a document from the database. */
export async function getFromNonIndex(request, logger = console) {
    const response = {
        isSuccess: false
    };
    const tableName = request.tableName;
    const queryObject = request.queryObject;
    const options = request.options;
    try {
        const documents = await LibMySql.getFromNonIndex(tableName, queryObject, options);
        response.isSuccess = true;
        response.documents = documents;

    } catch (e) {
        logger.error({
            err: e,
            tableName,
            queryObject,
            operation: 'getFromNonIndex'
        }, 'Error in getFromNonIndex operation');
        response.errorMessage = e.toString();

    }
    return response;
}

