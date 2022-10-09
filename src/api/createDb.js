import LibMySql from "@aicore/libmysql";
import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

const BAD_REQUEST = HTTP_STATUS_CODES.BAD_REQUEST;

async function _createDatabase(request, reply, databaseName) {
    const response = {
        isSuccess: false
    };
    try {
        request.log.info(` = ${databaseName}`);
        response.isSuccess = await LibMySql.createDataBase(databaseName);

    } catch (e) {
        reply.code(BAD_REQUEST);
        response.errorMessage = e.toString();
        request.log.error(e);
    }
    return response;
}

// Refer https://json-schema.org/understanding-json-schema/index.html
const createDbSchema = {
    schema: {
        body: {
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

export function getCreateDbSchema() {
    return createDbSchema;
}

export async function createDb(request, reply) {
    const databaseName = request.body.databaseName;
    return _createDatabase(request, reply, databaseName);
}
