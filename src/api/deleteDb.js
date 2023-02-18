import LibMySql from "@aicore/libmysql";
import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

const BAD_REQUEST = HTTP_STATUS_CODES.BAD_REQUEST;

async function _deleteDatabase(request, reply, databaseName) {
    const response = {
        isSuccess: false
    };
    try {
        response.isSuccess = await LibMySql.deleteDataBase(databaseName);

    } catch (e) {
        reply.code(BAD_REQUEST);
        response.errorMessage = e.toString();
        request.log.error(e);
    }
    return response;
}

// Refer https://json-schema.org/understanding-json-schema/index.html
const deleteDbSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['databaseName'],
            properties: {
                dataBaseName: {
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
                        default: ""
                    }
                }
            }
        }
    }
};

export function getDeleteDBSchema() {
    return deleteDbSchema;
}

export async function deleteDb(request, reply) {
    const databaseName = request.body.databaseName;
    return _deleteDatabase(request, reply, databaseName);
}
