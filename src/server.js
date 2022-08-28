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
import {init} from "@aicore/libmysql";
import {createTableRoute} from './api/createTable.js';
import {isAuthenticated} from "./auth/auth.js";

//const server = fastify({logger: true});
const server = fastify();
const configs = getConfigs();

server.get('/', async function (request, reply) {
    return {hello: 'world'};
});


server.register(createTableRoute);
// Activate authentication
server.addHook('onRequest', (request, reply, done) => {
    if (!isAuthenticated(request, reply)) {
        reply.code(402);
        done(new Error('Wrong key'));
    } else {
        done();
    }
});

async function initMysql() {
    try {

        if (!init(configs.mySqlConfigs)) {
            throw new Error('Exception occurred while connecting to DB');
        }
    } catch (e) {
        fastify.log.error(e);
        process.exit(1);
    }
}

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
