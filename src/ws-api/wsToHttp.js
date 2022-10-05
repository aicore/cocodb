import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
//import {createDb, deleteDb, init} from "@aicore/coco-db-client";
import {hello} from "./hello.js";
import {get} from "./get.js";
import {put} from "./put.js";
import {createTable} from "./createTable.js";
import {createDb} from "./createDb.js";
import {deleteDb} from "./deleteDb.js";


/**
 * It processes a message from the client, and returns a message to the client
 * @param message - The message object that was sent from the client.
 * @returns A promise that resolves to a message object.
 */
export async function processesMessage(message) {
    const fn = message.fn;
    const returnMessage = {
        id: message.id
    };
    switch (fn) {
    case COCO_DB_FUNCTIONS.hello:
        returnMessage.response = hello();
        return returnMessage;
    case COCO_DB_FUNCTIONS.get:
        returnMessage.response = await get(message.request);
        return returnMessage;

    case COCO_DB_FUNCTIONS.put:
        returnMessage.response = await put(message.request);
        return returnMessage;
    case COCO_DB_FUNCTIONS.createDb:
        returnMessage.response = await createDb(message.request);
        return returnMessage;
    case COCO_DB_FUNCTIONS.deleteDb:
        returnMessage.response = await deleteDb(message.request);
        return returnMessage;
    case COCO_DB_FUNCTIONS.createTable:
        returnMessage.response = await createTable(message.request);
        return returnMessage;
    }
}
