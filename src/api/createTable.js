import LibMySql from "@aicore/libmysql";

async function _createTable(request, reply, tableName) {
    const response = {
        isSuccess: false
    };
    try {
        request.log.info(`tableName = ${tableName}`);
        const isSuccess = await LibMySql.createTable(tableName);
        response.isSuccess = isSuccess;

    } catch (e) {
        reply.code(400);
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
            200: {
                type: 'object',
                required: ['isSuccess'],
                properties: {
                    isSuccess: {type: 'boolean'},
                    errorMessage: {type: 'string'}
                }
            },
            400: {
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
    request.log.error('hello');
    const tableName = request.body.tableName;
    const response = await _createTable(request, reply, tableName);
    if (!response.isSuccess) {
        reply.code(400);
    }
    return response;
}
