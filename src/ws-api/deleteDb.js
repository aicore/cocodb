import {getDeleteDBSchema} from "../api/deleteDb.js";
import {METRICS} from '../utils/constants.js';

import * as Metrics from '../utils/Metrics.js';

import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.deleteDb, getDeleteDBSchema().schema);

/* Getting a document from the database. */
export async function deleteDb(request, logger = console) {
    const response = {
        isSuccess: false
    };
    const databaseName = request.databaseName;
    try {
        response.isSuccess = await LibMySql.deleteDataBase(databaseName);
    } catch (e) {
        Metrics.countEvent(METRICS.WEBSOCKET, 'deleteDb', "error");
        logger.error({
            err: e,
            databaseName,
            operation: 'deleteDb'
        }, 'Error in deleteDb operation');
        response.errorMessage = e.toString();
    }
    return response;
}

