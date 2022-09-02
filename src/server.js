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
import {getConfigs} from "./utils/configs.js";
import LibMySql from "@aicore/libmysql";
import {createTable, getCreatTableSchema} from './api/createTable.js';
import {isAuthenticated} from "./auth/auth.js";
import {hello} from "./api/hello.js";
import {getPutSchema, putDocument} from "./api/put.js";

const server = fastify({logger: true});
//const server = fastify();
const configs = getConfigs();

/* Adding a authentication hook to the server. A hook is a function that is called when a request is made to the server. */
server.addHook('onRequest', (request, reply, done) => {
    if (!isAuthenticated(request, reply)) {
        reply.code(402);
        done(new Error('Wrong key'));
    } else {
        done();
    }
});


/* root handler. It is a function that is called when a request is made to the server. */
server.get('/', function (request, reply) {
    return hello(request, reply);
});
/* Creating a route handler for the POST request to the /createTable endpoint. */
server.post('/createTable', getCreatTableSchema(), async function (request, reply) {
    return await createTable(request, reply);
});
server.post('/put', getPutSchema(), async function (request, reply) {
    return await putDocument(request, reply);
});


/**
 * It initializes the connection to the database
 */
async function initMysql() {
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
async function startServer() {
    try {
        await server.listen({port: configs.port});
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

startServer();
initMysql();
