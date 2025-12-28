import LibMySql from "@aicore/libmysql";
import {METRICS} from '../utils/constants.js';

import * as Metrics from '../utils/Metrics.js';

import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

const BAD_REQUEST = HTTP_STATUS_CODES.BAD_REQUEST;

async function _createTable(request, reply, tableName) {
    const response = {
        isSuccess: false
    };
    try {
        response.isSuccess = await LibMySql.createTable(tableName);

    } catch (e) {
        Metrics.countEvent(METRICS.REQUEST, request.routeOptions.url || 'unknown', "error");
        reply.code(BAD_REQUEST);
        response.errorMessage = e.toString();
        request.log.error(e);
    }
    return response;
}

// Refer https://json-schema.org/understanding-json-schema/index.html
const createTableSchema = {
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
                    isSuccess: {type: 'boolean', default: false},
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

export function getCreatTableSchema() {
    return createTableSchema;
}

export async function createTable(request, reply) {
    const tableName = request.body.tableName;
    return _createTable(request, reply, tableName);
}
