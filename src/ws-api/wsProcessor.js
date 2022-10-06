import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import {hello} from "./hello.js";
import {get} from "./get.js";
import {put} from "./put.js";
import {createTable} from "./createTable.js";
import {createDb} from "./createDb.js";
import {deleteDb} from "./deleteDb.js";
import {createIndex} from "../api/createIndex.js";
import {getFromNonIndex} from "./getFromNonIndex.js";
import {getFromIndex} from "./getFromIndex.js";
import {deleteDocument} from "./deleteKey.js";
import {deleteTable} from "./deleteTable.js";
import {mathAdd} from "./mathadd.js";
import {update} from "./update.js";


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
    case  COCO_DB_FUNCTIONS.createIndex:
        returnMessage.response = await createIndex(message.request);
        return returnMessage;
    case COCO_DB_FUNCTIONS.getFromNonIndex:
        returnMessage.response = await getFromNonIndex(message.request);
        return returnMessage;
    case COCO_DB_FUNCTIONS.getFromIndex:
        returnMessage.response = await getFromIndex(message.request);
        return returnMessage;
    case COCO_DB_FUNCTIONS.deleteDocument:
        returnMessage.response = await deleteDocument(message.request);
        return returnMessage;
    case  COCO_DB_FUNCTIONS.deleteTable:
        returnMessage.response = await deleteTable(message.request);
        return returnMessage;
    case COCO_DB_FUNCTIONS.mathAdd:
        returnMessage.response = await mathAdd(message.request);
        return returnMessage;
    case  COCO_DB_FUNCTIONS.update:
        returnMessage.response = await update(message.request);
        return returnMessage;

    }
    returnMessage.response.isSuccess = false;
    returnMessage.response.errorMessage = 'API not defined';
    return returnMessage;
}
