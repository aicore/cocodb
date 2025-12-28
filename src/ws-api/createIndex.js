import {getCreateIndexSchema} from "../api/createIndex.js";
import {METRICS} from '../utils/constants.js';

import * as Metrics from '../utils/Metrics.js';

import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.createIndex, getCreateIndexSchema().schema);

/* Getting a document from the database. */
export async function createIndex(request, logger = console) {
    const response = {
        isSuccess: false
    };

    const tableName = request.tableName;
    const jsonField = request.jsonField;
    const dataType = request.dataType;
    const isUnique = (request.isUnique) ? request.isUnique : false;
    const isNotNull = (request.isNotNull) ? request.isNotNull : false;
    try {
        response.isSuccess = await LibMySql.createIndexForJsonField(tableName, jsonField, dataType, isUnique, isNotNull);
    } catch (e) {
        Metrics.countEvent(METRICS.WEBSOCKET, 'createIndex', "error");
        logger.error({
            err: e,
            tableName,
            jsonField,
            operation: 'createIndex'
        }, 'Error in createIndex operation');
        response.errorMessage = e.toString();
    }
    return response;
}

