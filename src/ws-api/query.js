import {getQuerySchema} from "../api/query.js";
import {METRICS} from '../utils/constants.js';

import * as Metrics from '../utils/Metrics.js';

import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.query, getQuerySchema().schema);

/* Getting a document from the database. */
export async function query(request, logger = console) {
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
        Metrics.countEvent(METRICS.WEBSOCKET, 'query', "error");
        logger.error({
            err: e,
            tableName,
            queryString,
            operation: 'query'
        }, 'Error in query operation');
        response.errorMessage = e.toString();

    }
    return response;
}

