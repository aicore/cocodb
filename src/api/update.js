import LibMySql from "@aicore/libmysql";
import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

// Refer https://json-schema.org/understanding-json-schema/index.html
const updateSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['tableName', 'documentId', 'document'],
            properties: {
                tableName: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 64
                },
                documentId: {
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

export function getUpdateSchema() {
    return updateSchema;
}

export async function update(request, reply) {
    const tableName = request.body.tableName;
    const document = request.body.document;
    const req_documentId = request.body.documentId;
    try {
        const documentId = await LibMySql.update(tableName, req_documentId, document);
        return {
            isSuccess: true,
            documentId: documentId
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
