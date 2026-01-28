import {getListDatabasesSchema} from "../api/listDatabases.js";
import {METRICS} from '../utils/constants.js';
import * as Metrics from '../utils/Metrics.js';
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

const FN_NAME = 'listDatabases';
addSchema(FN_NAME, getListDatabasesSchema().schema);

export async function listDatabases(request, logger = console) {
    const response = {
        isSuccess: false
    };
    try {
        response.databases = await LibMySql.listDatabases();
        response.isSuccess = true;
    } catch (e) {
        Metrics.countEvent(METRICS.WEBSOCKET, FN_NAME, "error");
        logger.error({
            err: e,
            operation: FN_NAME
        }, `Error in ${FN_NAME} operation`);
        response.errorMessage = e.toString();
    }
    return response;
}
