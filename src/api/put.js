import LibMySql from "@aicore/libmysql";
import {METRICS} from '../utils/constants.js';

import * as Metrics from '../utils/Metrics.js';

import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

// Refer https://json-schema.org/understanding-json-schema/index.html
const putSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['tableName', 'document'],
            properties: {
                tableName: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 64
                },
                document: {
                    type: 'object',
                    minProperties: 1
                }
            }
        },
        response: {
            200: {
                type: 'object',
                required: ['documentId', 'isSuccess'],
                properties: {
                    documentId: {type: 'string'},
                    isSuccess: {type: 'boolean'},
                    errorMessage: {
                        type: 'string'
                    }
                }
            },
            400: {
                type: 'object',
                required: ['isSuccess', 'errorMessage'],
                properties: {
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

export function getPutSchema() {
    return putSchema;
}

export async function putDocument(request, reply) {
    const tableName = request.body.tableName;
    const document = request.body.document;
    try {
        const documentId = await LibMySql.put(tableName, document);
        return {
            isSuccess: true,
            documentId: documentId
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
