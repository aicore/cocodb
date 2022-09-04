import LibMySql from "@aicore/libmysql";
import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

const BAD_REQUEST = HTTP_STATUS_CODES.BAD_REQUEST;

// Refer https://json-schema.org/understanding-json-schema/index.html
const deleteKeySchema = {
    schema: {
        body: {
            type: 'object', required: ['tableName', 'documentId'], properties: {
                tableName: {
                    type: 'string', minLength: 1, maxLength: 64
                }, documentId: {
                    type: 'string', minLength: 1, maxLength: 32
                }
            }
        }, response: {
            200: { //HTTP_STATUS_CODES.OK
                type: 'object', required: ['isSuccess'], properties: {
                    isSuccess: {type: 'boolean', default: false}, errorMessage: {type: 'string'}
                }
            }, 400: { //HTTP_STATUS_CODES.BAD_REQUEST
                type: 'object', required: ['isSuccess', 'errorMessage'], properties: {
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

export function getDeleteKeySchema() {
    return deleteKeySchema;
}

export async function deleteKey(request, reply) {
    const tableName = request.body.tableName;
    const documentId = request.body.documentId;

    const response = {
        isSuccess: false
    };
    try {
        request.log.info(`tableName = ${tableName} documentID =${documentId}`);
        response.isSuccess = await LibMySql.deleteKey(tableName, documentId);

    } catch (e) {
        reply.code(BAD_REQUEST);
        response.errorMessage = e.toString();
        request.log.error(e);
    }
    return response;
}
