import LibMySql from "@aicore/libmysql";
import {METRICS} from '../utils/constants.js';

import * as Metrics from '../utils/Metrics.js';

import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

const BAD_REQUEST = HTTP_STATUS_CODES.BAD_REQUEST;

// Refer https://json-schema.org/understanding-json-schema/index.html
const createIndexSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['tableName', 'jsonField', 'dataType'],
            properties: {
                tableName: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 64
                },
                jsonField: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 64
                },
                dataType: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 64
                },
                isUnique: {
                    type: 'boolean'
                },
                isNotNull: {
                    type: 'boolean'
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

export function getCreateIndexSchema() {
    return createIndexSchema;
}

export async function createIndex(request, reply) {
    const tableName = request.body.tableName;
    const jsonField = request.body.jsonField;
    const dataType = request.body.dataType;
    const isUnique = (request.body.isUnique) ? request.body.isUnique : false;
    const isNotNull = (request.body.isNotNull) ? request.body.isNotNull : false;

    const response = {
        isSuccess: false
    };
    try {
        response.isSuccess = await LibMySql.createIndexForJsonField(tableName,
            jsonField, dataType, isUnique, isNotNull);

    } catch (e) {
        Metrics.countEvent(METRICS.REQUEST, request.routeOptions?.url || 'unknown', "error");
        response.isSuccess = false;
        reply.code(BAD_REQUEST);
        response.errorMessage = e.toString();
        request.log.error(e);
    }
    return response;

}
