import LibMySql from "@aicore/libmysql";
import {METRICS} from '../utils/constants.js';

import * as Metrics from '../utils/Metrics.js';

import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

// Refer https://json-schema.org/understanding-json-schema/index.html
const schema = {
    schema: {
        body: {
            type: 'object',
            required: ['tableName', 'documentId', 'jsonFieldsIncrements'],
            properties: {
                tableName: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 64
                },
                documentId: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 32
                },
                jsonFieldsIncrements: {
                    type: 'object',
                    minProperties: 1
                },
                condition: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 2048
                }
            }
        },
        response: {
            200: { //HTTP_STATUS_CODES.OK
                type: 'object',
                required: ['isSuccess'],
                properties: {
                    isSuccess: {
                        type: 'boolean',
                        default: false
                    },
                    errorMessage: {type: 'string'}
                }
            },
            400: { //HTTP_STATUS_CODES.BAD_REQUEST
                type: 'object',
                required: ['isSuccess', 'errorMessage'],
                properties: {
                    isSuccess: {
                        type: 'boolean',
                        default: false
                    },
                    errorMessage: {
                        type: 'string',
                        default: ""
                    }
                }
            }
        }
    }
};

export function getMathAddSchema() {
    return schema;
}

/**
 * It takes a table name, a document id, and a map of fields to increment, and increments the fields in the document with
 * the given id in the given table. Optionally accepts a condition that must be satisfied for increment to happen.
 * @param{Object} request - The request object.
 * @param {Object} reply - The reply object that is used to send the response back to the client.
 * @returns {Promise} The response is an object with a property isSuccess.
 */
export async function mathAdd(request, reply) {
    const tableName = request.body.tableName;
    const jsonFieldsIncrements = request.body.jsonFieldsIncrements;
    const documentId = request.body.documentId;
    const condition = request.body.condition;
    try {
        const success = await LibMySql.mathAdd(tableName, documentId, jsonFieldsIncrements, condition);
        return {
            isSuccess: success
        };
    } catch (e) {
        Metrics.countEvent(METRICS.REQUEST, request.routeOptions.url || 'unknown', "error");
        const response = {
            isSuccess: false,
            errorMessage: e.toString()
        };
        reply.code(HTTP_STATUS_CODES.BAD_REQUEST);
        request.log.error(e);
        return response;
    }
}
