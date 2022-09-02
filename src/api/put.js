import LibMySql from "@aicore/libmysql";

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
                required: ['isSuccess'],
                properties: {
                    documentId: {type: 'string'},
                    isSuccess: {type: 'boolean'},
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
    } catch (e) {

    }
}
