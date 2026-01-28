import {getGetTableIndexesSchema} from "../api/getTableIndexes.js";
import {METRICS} from '../utils/constants.js';
import * as Metrics from '../utils/Metrics.js';
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

const FN_NAME = 'getTableIndexes';
addSchema(FN_NAME, getGetTableIndexesSchema().schema);

export async function getTableIndexes(request, logger = console) {
    const response = {
        isSuccess: false
    };
    const tableName = request.tableName;
    try {
        response.indexes = await LibMySql.getTableIndexes(tableName);
        response.isSuccess = true;
    } catch (e) {
        Metrics.countEvent(METRICS.WEBSOCKET, FN_NAME, "error");
        logger.error({
            err: e,
            tableName,
            operation: FN_NAME
        }, `Error in ${FN_NAME} operation`);
        response.errorMessage = e.toString();
    }
    return response;
}
