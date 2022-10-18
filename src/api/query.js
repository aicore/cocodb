import LibMySql from "@aicore/libmysql";
import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

// Refer https://json-schema.org/understanding-json-schema/index.html
const querySchema = {
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
                queryString: {
                    type: 'string',
                    minLength: 1
                },
                useIndexForFields: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    default: []
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
                        type: 'array',
                        contains: {
                            type: 'object',
                            additionalProperties: true,
                            minItems: 0
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
                    isSuccess: {
                        type: 'boolean',
                        default: false
                    },
                    errorMessage: {
                        type: 'string',
                        default: "Request Validation failed"
                    }
                }
            }
        }
    }
};

export function getQuerySchema() {
    return querySchema;
}

export async function query(request, reply) {
    const tableName = request.body.tableName;
    const queryString = request.body.queryString;
    const useIndexForFields = request.body.useIndexForFields;
    try {
        const documents = await LibMySql.query(tableName, queryString, useIndexForFields);
        return {
            isSuccess: true,
            documents: documents
        };
    } catch (e) {
        const response = {
            isSuccess: false,
            errorMessage: e.toString()
        };
        reply.code(HTTP_STATUS_CODES.BAD_REQUEST);
        request.log.error(e);
        return response;
    }
}
