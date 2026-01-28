import {getListTablesSchema} from "../api/listTables.js";
import {METRICS} from '../utils/constants.js';
import * as Metrics from '../utils/Metrics.js';
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

const FN_NAME = 'listTables';
addSchema(FN_NAME, getListTablesSchema().schema);

export async function listTables(request, logger = console) {
    const response = {
        isSuccess: false
    };
    const databaseName = request.databaseName;
    try {
        response.tables = await LibMySql.listTables(databaseName);
        response.isSuccess = true;
    } catch (e) {
        Metrics.countEvent(METRICS.WEBSOCKET, FN_NAME, "error");
        logger.error({
            err: e,
            databaseName,
            operation: FN_NAME
        }, `Error in ${FN_NAME} operation`);
        response.errorMessage = e.toString();
    }
    return response;
}
