import {createTable as mysqlCreateTable} from "@aicore/libmysql";

async function _createTable(tableName) {
    const response = {
        isSuccess: false
    };
    try {
        console.log(`tableName = ${tableName}`);
        const isSuccess = await mysqlCreateTable(tableName);
        response.isSuccess = isSuccess;

    } catch (e) {
        response.errorMessage1 = `Exception occurred while creating table \n ${e}`;
        console.error(e);
    }
    return response;

}

const creatTableSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['tableName'],
            properties: {
                tableName: {
                    type: 'string',
                    "minLength": 1,
                    "maxLength": 64
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
            }
        }
    }
};

export function getCreatTableSchema() {
    return creatTableSchema;
}

export async function createTable(request, reply) {
    const tableName = request.body.tableName;
    const response = await _createTable(tableName);
    return response;
}
