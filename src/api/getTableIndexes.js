// @INCLUDE_IN_API_DOCS
import LibMySql from "@aicore/libmysql";
import {METRICS} from '../utils/constants.js';
import * as Metrics from '../utils/Metrics.js';
import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

const BAD_REQUEST = HTTP_STATUS_CODES.BAD_REQUEST;

/**
 * Gets index information for a table.
 * @param {Object} request - The Fastify request object
 * @param {Object} reply - The Fastify reply object
 * @param {string} tableName - The table name in database.tableName format
 * @returns {Promise<Object>} A promise resolving to {isSuccess: boolean, indexes: IndexInfo[]}
 */
async function _getTableIndexes(request, reply, tableName) {
    const response = {
        isSuccess: false
    };
    try {
        response.indexes = await LibMySql.getTableIndexes(tableName);
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
const getTableIndexesSchema = {
    schema: {
        querystring: {
            type: 'object',
            required: ['tableName'],
            properties: {
                tableName: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 128
                }
            }
        },
        response: {
            200: { //HTTP_STATUS_CODES.OK
                type: 'object',
                required: ['isSuccess'],
                properties: {
                    isSuccess: {type: 'boolean', default: false},
                    indexes: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                indexName: {type: 'string'},
                                columnName: {type: 'string'},
                                jsonField: {type: ['string', 'null']},
                                isUnique: {type: 'boolean'},
                                isPrimary: {type: 'boolean'},
                                sequenceInIndex: {type: 'number'},
                                indexType: {type: 'string'},
                                isNullable: {type: 'boolean'}
                            }
                        },
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

export function getGetTableIndexesSchema() {
    return getTableIndexesSchema;
}

export async function getTableIndexes(request, reply) {
    const tableName = request.query.tableName;
    return _getTableIndexes(request, reply, tableName);
}
