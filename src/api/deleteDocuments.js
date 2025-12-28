import LibMySql from "@aicore/libmysql";
import {METRICS} from '../utils/constants.js';

import * as Metrics from '../utils/Metrics.js';

import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

const BAD_REQUEST = HTTP_STATUS_CODES.BAD_REQUEST;

// Refer https://json-schema.org/understanding-json-schema/index.html
const deleteDocumentsSchema = {
    schema: {
        body: {
            type: 'object', required: ['tableName', 'queryString'], properties: {
                tableName: {
                    type: 'string', minLength: 1, maxLength: 64
                }, queryString: {
                    type: 'string', minLength: 1, maxLength: 2048
                }, useIndexForFields: {
                    type: 'array', items: {
                        type: 'string',
                        minLength: 1, maxLength: 512
                    }, default: []
                }
            }
        }, response: {
            200: { //HTTP_STATUS_CODES.OK
                type: 'object', required: ['isSuccess', 'deleteCount'], properties: {
                    isSuccess: {type: 'boolean', default: false},
                    deleteCount: {type: 'integer', default: 0},
                    errorMessage: {type: 'string'}
                }
            }, 400: { //HTTP_STATUS_CODES.BAD_REQUEST
                type: 'object', required: ['isSuccess', 'errorMessage'], properties: {
                    isSuccess: {type: 'boolean', default: false},
                    errorMessage: {
                        type: 'string',
                        default: ""
                    }
                }
            }
        }
    }
};

export function getDeleteDocumentsSchema() {
    return deleteDocumentsSchema;
}

export async function deleteDocuments(request, reply) {
    const tableName = request.body.tableName;
    const queryString = request.body.queryString;
    const useIndexForFields = request.body.useIndexForFields;

    const response = {
        isSuccess: false
    };
    try {
        response.deleteCount = await LibMySql.deleteDocuments(tableName, queryString, useIndexForFields);
        response.isSuccess = true;
    } catch (e) {
        Metrics.countEvent(METRICS.REQUEST, request.routeOptions?.url || 'unknown', "error");
        reply.code(BAD_REQUEST);
        response.errorMessage = e.toString();
        request.log.error(e);
    }
    return response;
}
