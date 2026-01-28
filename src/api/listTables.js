// @INCLUDE_IN_API_DOCS
import LibMySql from "@aicore/libmysql";
import {METRICS} from '../utils/constants.js';
import * as Metrics from '../utils/Metrics.js';
import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

const BAD_REQUEST = HTTP_STATUS_CODES.BAD_REQUEST;

/**
 * Lists all tables in a database.
 * @param {Object} request - The Fastify request object
 * @param {Object} reply - The Fastify reply object
 * @param {string} databaseName - The name of the database
 * @returns {Promise<Object>} A promise resolving to {isSuccess: boolean, tables: string[]}
 */
async function _listTables(request, reply, databaseName) {
    const response = {
        isSuccess: false
    };
    try {
        response.tables = await LibMySql.listTables(databaseName);
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
const listTablesSchema = {
    schema: {
        querystring: {
            type: 'object',
            required: ['databaseName'],
            properties: {
                databaseName: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 63
                }
            }
        },
        response: {
            200: { //HTTP_STATUS_CODES.OK
                type: 'object',
                required: ['isSuccess'],
                properties: {
                    isSuccess: {type: 'boolean', default: false},
                    tables: {
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

export function getListTablesSchema() {
    return listTablesSchema;
}

export async function listTables(request, reply) {
    const databaseName = request.query.databaseName;
    return _listTables(request, reply, databaseName);
}
