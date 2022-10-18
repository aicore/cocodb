import LibMySql from "@aicore/libmysql";
import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

const BAD_REQUEST = HTTP_STATUS_CODES.BAD_REQUEST;
// Refer https://json-schema.org/understanding-json-schema/index.html
const schema = {
    schema: {
        body: {
            type: 'object', required: ['tableName', 'queryObject'], properties: {
                tableName: {
                    type: 'string', minLength: 1, maxLength: 64
                }, queryObject: {
                    type: 'object', minProperties: 1
                }
            }
        }, response: {
            200: { //HTTP_STATUS_CODES.OK
                type: 'object', required: ['isSuccess', 'documents'], properties: {
                    isSuccess: {
                        type: 'boolean', default: false
                    }, documents: {
                        anyOf: [{
                            type: 'array', contains: {
                                type: 'object', additionalProperties: true, minProperties: 0
                            }, default: []
                        }, {
                            type: 'array', default: [], minItems: 0, maxItems: 0
                        }]
                    },

                    errorMessage: {
                        type: 'string'
                    }

                }
            }, 400: { //HTTP_STATUS_CODES.BAD_REQUEST
                type: 'object', required: ['isSuccess', 'errorMessage'], properties: {
                    isSuccess: {
                        type: 'boolean', default: false
                    }, errorMessage: {
                        type: 'string', default: ""
                    }
                }
            }
        }
    }
};

export function getFromIndexSchema() {
    return schema;
}

export async function getFromIndex(request, reply) {
    const tableName = request.body.tableName;
    const queryObject = request.body.queryObject;
    try {
        const documents = await LibMySql.getFromIndex(tableName, queryObject);
        return {
            isSuccess: true, documents: documents
        };
    } catch (e) {
        const response = {
            isSuccess: false, errorMessage: e.toString()
        };
        reply.code(BAD_REQUEST);
        request.log.error(e);
        return response;
    }
}
