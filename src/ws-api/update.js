import {getUpdateSchema} from "../api/update.js";
import {METRICS} from '../utils/constants.js';

import * as Metrics from '../utils/Metrics.js';

import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import LibMySql from "@aicore/libmysql";
import {addSchema} from "./validator/validator.js";

addSchema(COCO_DB_FUNCTIONS.update, getUpdateSchema().schema);

/* Getting a document from the database. */
export async function update(request, logger = console) {
    const response = {
        isSuccess: false
    };
    const tableName = request.tableName;
    const documentId = request.documentId;
    const document = request.document;
    const condition = request.condition;
    try {
        const modifiedDocumentId = await LibMySql.update(tableName, documentId, document, condition);
        response.isSuccess = true;
        response.documentId = modifiedDocumentId;

    } catch (e) {
        Metrics.countEvent(METRICS.WEBSOCKET, 'update', "error");
        logger.error({
            err: e,
            tableName,
            documentId,
            operation: 'update'
        }, 'Error in update operation');
        response.errorMessage = e.toString();

    }
    return response;
}

