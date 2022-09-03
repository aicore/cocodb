import LibMySql from "@aicore/libmysql";
import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

// Refer https://json-schema.org/understanding-json-schema/index.html
const putSchema = {
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
                document: {
                    type: 'object',
                    minProperties: 1
                }
            }
        },
        response: {
            200: {
                type: 'object',
                required: ['documentId'],
                properties: {
                    documentId: {type: 'string'},
                    errorMessage: {type: 'string'}
                }
            },
            400: {
                type: 'object',
                required: ['errorMessage'],
                properties: {
                    errorMessage: {type: 'string'}
                }
            }
        }
    }
};

export function getPutSchema() {
    return putSchema;
}

export async function putDocument(request, reply) {
    const tableName = request.body.tableName;
    const document = request.body.document;
    try {
        const documentId = await LibMySql.put(tableName, document);
        return {
            documentId: documentId
        };
    } catch (e) {
        const response = {
            errorMessage: e.toString()
        };
        reply.code(HTTP_STATUS_CODES.BAD_REQUEST);
        request.log.error(e);
        return response;
    }
}
