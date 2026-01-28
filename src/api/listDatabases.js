// @INCLUDE_IN_API_DOCS
import LibMySql from "@aicore/libmysql";
import {METRICS} from '../utils/constants.js';
import * as Metrics from '../utils/Metrics.js';
import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

const BAD_REQUEST = HTTP_STATUS_CODES.BAD_REQUEST;

/**
 * Lists all databases on the MySQL server.
 * @param {Object} request - The Fastify request object
 * @param {Object} reply - The Fastify reply object
 * @returns {Promise<Object>} A promise resolving to {isSuccess: boolean, databases: string[]}
 */
async function _listDatabases(request, reply) {
    const response = {
        isSuccess: false
    };
    try {
        response.databases = await LibMySql.listDatabases();
        response.isSuccess = true;
    } catch (e) {
        Metrics.countEvent(METRICS.REQUEST, request.routeOptions?.url || 'unknown', "error");
        reply.code(BAD_REQUEST);
        response.errorMessage = e.toString();
        request.log.error(e);
    }
    return response;
}

// Refer https://json-schema.org/understanding-json-schema/index.html
const listDatabasesSchema = {
    schema: {
        // Empty body schema for WebSocket validation
        body: {
            type: 'object',
            properties: {},
            additionalProperties: false
        },
        response: {
            200: { //HTTP_STATUS_CODES.OK
                type: 'object',
                required: ['isSuccess'],
                properties: {
                    isSuccess: {type: 'boolean', default: false},
                    databases: {
                        type: 'array',
                        items: {type: 'string'},
                        default: []
                    },
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
                        default: "Please provide valid parameters"
                    }
                }
            }
        }
    }
};

export function getListDatabasesSchema() {
    return listDatabasesSchema;
}

export async function listDatabases(request, reply) {
    return _listDatabases(request, reply);
}
