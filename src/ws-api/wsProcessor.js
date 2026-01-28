import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";
import {hello} from "./hello.js";
import {get} from "./get.js";
import {put} from "./put.js";
import {createTable} from "./createTable.js";
import {createDb} from "./createDb.js";
import {deleteDb} from "./deleteDb.js";
import {createIndex} from "./createIndex.js";
import {getFromNonIndex} from "./getFromNonIndex.js";
import {getFromIndex} from "./getFromIndex.js";
import {deleteDocument} from "./deleteDocument.js";
import {deleteDocuments} from "./deleteDocuments.js";
import {deleteTable} from "./deleteTable.js";
import {mathAdd} from "./mathadd.js";
import {update} from "./update.js";
import {validateRequest, validateResponse} from "./validator/validator.js";
import {query} from "./query.js";
import {listDatabases} from "./listDatabases.js";
import {listTables} from "./listTables.js";
import {getTableIndexes} from "./getTableIndexes.js";


/**
 * It processes a message from the client, and returns a message to the client
 * @param {Object} message - The message object that was sent from the client.
 * @param {string} message.fn - function Name
 * @param {string} message.id - sequence number of message
 * @param {Object} message.request - parameters of functions to call
 * @param {Object} logger - Logger instance for structured logging
 * @returns {Promise<Object>}  A promise that resolves to a message object.
 */
export async function processesMessage(message, logger = console) {
    const fn = message.fn;
    const returnMessage = {
        id: message.id,
        fn: message.fn
    };
    if (validateRequest(message.fn, message.request)) {
        switch (fn) {
        case COCO_DB_FUNCTIONS.hello:
            returnMessage.response = hello();
            break;
        case COCO_DB_FUNCTIONS.get:
            returnMessage.response = await get(message.request, logger);
            break;

        case COCO_DB_FUNCTIONS.put:
            returnMessage.response = await put(message.request, logger);
            break;
        case COCO_DB_FUNCTIONS.createDb:
            returnMessage.response = await createDb(message.request, logger);
            break;
        case COCO_DB_FUNCTIONS.deleteDb:
            returnMessage.response = await deleteDb(message.request, logger);
            break;
        case COCO_DB_FUNCTIONS.createTable:
            returnMessage.response = await createTable(message.request, logger);
            break;
        case  COCO_DB_FUNCTIONS.createIndex:
            returnMessage.response = await createIndex(message.request, logger);
            break;
        case COCO_DB_FUNCTIONS.getFromNonIndex:
            returnMessage.response = await getFromNonIndex(message.request, logger);
            break;
        case COCO_DB_FUNCTIONS.getFromIndex:
            returnMessage.response = await getFromIndex(message.request, logger);
            break;
        case COCO_DB_FUNCTIONS.deleteDocument:
            returnMessage.response = await deleteDocument(message.request, logger);
            break;
        case COCO_DB_FUNCTIONS.deleteDocuments:
            returnMessage.response = await deleteDocuments(message.request, logger);
            break;
        case  COCO_DB_FUNCTIONS.deleteTable:
            returnMessage.response = await deleteTable(message.request, logger);
            break;
        case COCO_DB_FUNCTIONS.mathAdd:
            returnMessage.response = await mathAdd(message.request, logger);
            break;
        case  COCO_DB_FUNCTIONS.update:
            returnMessage.response = await update(message.request, logger);
            break;
        case  COCO_DB_FUNCTIONS.query:
            returnMessage.response = await query(message.request, logger);
            break;
        case 'listDatabases':
            returnMessage.response = await listDatabases(message.request, logger);
            break;
        case 'listTables':
            returnMessage.response = await listTables(message.request, logger);
            break;
        case 'getTableIndexes':
            returnMessage.response = await getTableIndexes(message.request, logger);
            break;
        default:
            returnMessage.response.isSuccess = false;
            returnMessage.response.errorMessage = 'API not defined';
        }
    } else {
        returnMessage.response = {
            isSuccess: false,
            errorMessage: 'request validation Failed'
        };
    }

    if (!validateResponse(message.fn, returnMessage.response)) {
        logger.error({
            fn: message.fn,
            messageId: message.id,
            response: returnMessage
        }, 'Response validation failed');
        return {
            id: message.id,
            fn: message.fn,
            response: {
                isSuccess: false,
                errorMessage: 'server did not send valid data'
            }

        };
    }
    return returnMessage;
}
