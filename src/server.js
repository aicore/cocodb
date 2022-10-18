/*
 * GNU AGPL-3.0 License
 *
 * Copyright (c) 2021 - present core.ai . All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see https://opensource.org/licenses/AGPL-3.0.
 *
 */

import fastify from "fastify";
import websocket from "@fastify/websocket";
import {getConfigs} from "./utils/configs.js";
import LibMySql from "@aicore/libmysql";
import {createTable, getCreatTableSchema} from './api/createTable.js';
import {init, isAuthenticated} from "./auth/auth.js";
import {hello} from "./api/hello.js";
import {getPutSchema, putDocument} from "./api/put.js";
import {deleteKey, getDeleteKeySchema} from "./api/deleteKey.js";
import {deleteTable, getDeleteTableSchema} from "./api/deleteTable.js";
import {createIndex, getCreateIndexSchema} from "./api/createIndex.js";
import {getUpdateSchema, update} from "./api/update.js";
import {getFromNonIndex, getFromNonIndexSchema} from "./api/getFromNonIndex.js";
import {getSchema, get} from "./api/get.js";
import {getFromIndex, getFromIndexSchema} from "./api/getFromIndex.js";
import {HTTP_STATUS_CODES} from "@aicore/libcommonutils";
import {createDb, getCreateDbSchema} from "./api/createDb.js";
import {deleteDb, getDeleteDBSchema} from "./api/deleteDb.js";
import {getMathAddSchema, mathAdd} from "./api/mathadd.js";
import {processesMessage} from "./ws-api/wsProcessor.js";
import {getQuerySchema, query} from "./api/query.js";

const server = fastify({logger: true});
server.register(websocket, {
    options: {maxPayload: 1048576}
});

/* Registering a websocket handler. */
server.register(async function (fastify) {
    fastify.get('/ws/', {websocket: true}, (connection /* SocketStream */, _req /* FastifyRequest */) => {
        connection.socket.on('message', async message => {
            const response = await processesMessage(JSON.parse(message));
            connection.socket.send(JSON.stringify(response));
        });
    });
});

/* Adding an authentication hook to the server. A hook is a function that is called when a request is made to
the server. */
server.addHook('onRequest', (request, reply, done) => {
    if (!isAuthenticated(request, reply)) {
        reply.code(HTTP_STATUS_CODES.UNAUTHORIZED);
        done(new Error('Wrong key'));
    } else {
        done();
    }
});


/* root handler. It is a function that is called when a request is made to the server. */
server.get('/', function (request, reply) {
    return hello(request, reply);
});
server.get('/get', getSchema(), function (request, reply) {
    return get(request, reply);
});

/* Creating a route handler for the POST request to the /createTable endpoint. */
server.post('/createTable', getCreatTableSchema(), function (request, reply) {
    return createTable(request, reply);
});
server.post('/put', getPutSchema(), function (request, reply) {
    return putDocument(request, reply);
});
server.post('/deleteDocument', getDeleteKeySchema(), function (request, reply) {
    return deleteKey(request, reply);
});
server.post('/deleteTable', getDeleteTableSchema(), function (request, reply) {
    return deleteTable(request, reply);
});

server.post('/createIndex', getCreateIndexSchema(), function (request, reply) {
    return createIndex(request, reply);
});

server.post('/update', getUpdateSchema(), function (request, reply) {
    return update(request, reply);
});
server.post('/getFromNonIndex', getFromNonIndexSchema(), function (request, reply) {
    return getFromNonIndex(request, reply);
});
server.post('/getFromIndex', getFromIndexSchema(), function (request, reply) {
    return getFromIndex(request, reply);
});
server.post('/createDb', getCreateDbSchema(), function (request, reply) {
    return createDb(request, reply);
});
server.post('/deleteDb', getDeleteDBSchema(), function (request, reply) {
    return deleteDb(request, reply);
});

server.post('/mathAdd', getMathAddSchema(), function (request, reply) {
    return mathAdd(request, reply);
});
server.post('/query', getQuerySchema(), function (request, reply) {
    return query(request, reply);
});

/**
 * It initializes the connection to the database
 */
export async function initMysql(configs) {
    try {

        if (!LibMySql.init(configs.mysql)) {
            throw new Error('Exception occurred while connecting to DB');
        }
    } catch (e) {
        fastify.log.error(e);
        process.exit(1);
    }
}

/**
 * It starts the server and listens on the port specified in the configs
 */
export async function startServer(configs) {
    try {
        init(configs.authKey);
        await server.listen({port: configs.port, host: configs.allowPublicAccess ? '0.0.0.0' : 'localhost'});
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

export async function close() {
    await server.close();
    LibMySql.close();
}

export async function startDB() {
    const serverConfigs = getConfigs();
    await startServer(serverConfigs);
    await initMysql(serverConfigs);
}
