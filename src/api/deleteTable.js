// Refer https://json-schema.org/understanding-json-schema/index.html
import LibMySql from "@aicore/libmysql";
import {METRICS} from '../utils/constants.js';

import * as Metrics from '../utils/Metrics.js';

import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

const BAD_REQUEST = HTTP_STATUS_CODES.BAD_REQUEST;

const deleteTableSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['tableName'],
            properties: {
                tableName: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 64
                }
            }
        },
        response: {
            200: { //HTTP_STATUS_CODES.OK
                type: 'object',
                required: ['isSuccess'],
                properties: {
                    isSuccess: {type: 'boolean'},
                    errorMessage: {type: 'string'}
                }
            },
            400: { //HTTP_STATUS_CODES.BAD_REQUEST
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

export function getDeleteTableSchema() {
    return deleteTableSchema;
}

export async function deleteTable(request, reply) {
    const tableName = request.body.tableName;
    try {
        const isSuccess = await LibMySql.deleteTable(tableName);
        return {
            isSuccess: isSuccess
        };
    } catch (e) {
        Metrics.countEvent(METRICS.REQUEST, request.routeOptions.url || 'unknown', "error");
        const response = {
            isSuccess: false,
            errorMessage: e.toString()
        };
        reply.code(BAD_REQUEST);
        request.log.error(e);
        return response;
    }
}
