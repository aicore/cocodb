import LibMySql from "@aicore/libmysql";
import {METRICS} from '../utils/constants.js';

import * as Metrics from '../utils/Metrics.js';

import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

const BAD_REQUEST = HTTP_STATUS_CODES.BAD_REQUEST;
// Refer https://json-schema.org/understanding-json-schema/index.html
const schema = {
    schema: {
        querystring: {
            type: 'object',
            required: ['tableName', 'documentId'],
            properties: {
                tableName: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 64
                },
                documentId: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 64
                }
            }
        },
        response: {
            200: { //HTTP_STATUS_CODES.OK
                type: 'object',
                required: ['isSuccess', 'document'],
                properties: {
                    isSuccess: {
                        type: 'boolean',
                        default: false
                    },
                    document: {type: 'object',
                        additionalProperties: true
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

export function getSchema() {
    return schema;
}

export async function get(request, reply) {
    const tableName = request.query.tableName;
    const documentId = request.query.documentId;
    const response = {
        isSuccess: false
    };
    try {
        const document = await LibMySql.get(tableName, documentId);
        response.isSuccess = true;
        response.document = document;
        return response;

    } catch (e) {
        Metrics.countEvent(METRICS.REQUEST, request.routeOptions?.url || 'unknown', "error");
        request.log.error(e);
        reply.code(BAD_REQUEST);
        response.errorMessage = e.toString();
        return response;
    }
}
