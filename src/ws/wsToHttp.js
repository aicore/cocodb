import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import {createDb, createTable, deleteDb, get, hello, put, init} from "@aicore/coco-db-client";

export function initlialize(config) {

    init('http://localhost:' + config.port);
}

export async function processesMessage(message) {
    const fn = message.fn;
    switch (fn) {
    case COCO_DB_FUNCTIONS.hello:
        return await hello();
    case COCO_DB_FUNCTIONS.get:
        return await get(message.params.tableName, message.params.documentId);

    case COCO_DB_FUNCTIONS.put:
        return await put(message.params.tableName, message.params.document);

    case COCO_DB_FUNCTIONS.createDb:
        return await createDb(message.params.dataBaseName);
    case COCO_DB_FUNCTIONS.deleteDb:
        return await deleteDb(message.params.dataBaseName);
    case COCO_DB_FUNCTIONS.createTable:
        return await createTable(message.params.tableName);
    }


}
