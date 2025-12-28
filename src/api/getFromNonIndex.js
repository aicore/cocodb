import LibMySql from "@aicore/libmysql";
import {METRICS} from '../utils/constants.js';

import * as Metrics from '../utils/Metrics.js';

import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

// Refer https://json-schema.org/understanding-json-schema/index.html
const schema = {
    schema: {
        body: {
            type: 'object',
            required: ['tableName'],
            properties: {
                tableName: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 64
                },
                queryObject: {
                    type: 'object',
                    default: {}
                },
                options: {
                    type: 'object',
                    default: {},
                    properties: {
                        pageOffset: {
                            type: 'integer'
                        },
                        pageLimit: {
                            type: 'integer'
                        }
                    }
                }
            }
        },
        response: {
            200: { //HTTP_STATUS_CODES.OK
                type: 'object',
                required: ['isSuccess', 'documents'],
                properties: {
                    isSuccess: {
                        type: 'boolean',
                        default: false
                    },
                    documents: {
                        anyOf: [{
                            type: 'array',
                            contains: {
                                type: 'object',
                                additionalProperties: true,
                                minProperties: 0
                            },
                            default: []
                        }, {
                            type: 'array',
                            default: [],
                            minItems: 0,
                            maxItems: 0
                        }]
                    },

                    errorMessage: {
                        type: 'string'
                    }

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

export function getFromNonIndexSchema() {
    return schema;
}


export async function getFromNonIndex(request, reply) {
    const tableName = request.body.tableName;
    const queryObject = request.body.queryObject;
    const options = request.body.options;
    try {
        const documents = await LibMySql.getFromNonIndex(tableName, queryObject, options);
        return {
            isSuccess: true,
            documents: documents
        };
    } catch (e) {
        Metrics.countEvent(METRICS.REQUEST, request.routeOptions?.url || 'unknown', "error");
        const response = {
            isSuccess: false,
            errorMessage: e.toString()
        };
        reply.code(HTTP_STATUS_CODES.BAD_REQUEST);
        request.log.error(e);
        return response;
    }
}
