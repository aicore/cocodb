import LibMySql from "@aicore/libmysql";
import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";

const BAD_REQUEST = HTTP_STATUS_CODES.BAD_REQUEST;

async function _createTable(request, reply, tableName) {
    const response = {
        isSuccess: false
    };
    try {
        request.log.info(`tableName = ${tableName}`);
        const isSuccess = await LibMySql.createTable(tableName);
        response.isSuccess = isSuccess;

    } catch (e) {
        reply.code(BAD_REQUEST);
        response.errorMessage = `Exception occurred while creating table`;
        request.log.error(e);
    }
    return response;
}

// Refer https://json-schema.org/understanding-json-schema/index.html
const creatTableSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['tableName'],
            properties: {
                tableName: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 64
                }
            }
        },
        response: {
            200: { //HTTP_STATUS_CODES.OK
                type: 'object',
                required: ['isSuccess'],
                properties: {
                    isSuccess: {type: 'boolean'},
                    errorMessage: {type: 'string'}
                }
            },
            400: { //HTTP_STATUS_CODES.BAD_REQUEST
                type: 'object',
                required: ['isSuccess', 'errorMessage'],
                properties: {
                    isSuccess: {type: 'boolean'},
                    errorMessage: {type: 'string'}
                }
            }
        }
    }
};

export function getCreatTableSchema() {
    return creatTableSchema;
}

export async function createTable(request, reply) {
    const tableName = request.body.tableName;
    const response = await _createTable(request, reply, tableName);
    return response;
}
