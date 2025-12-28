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
import * as websocket from "@fastify/websocket";
import crypto from 'crypto';
import {getConfigs} from "./utils/configs.js";
import {createFastifyLogger} from './utils/logger.js';
import LibMySql from "@aicore/libmysql";
import {createTable, getCreatTableSchema} from './api/createTable.js';
import {init, isAuthenticated} from "./auth/auth.js";
import {hello} from "./api/hello.js";
import {getPutSchema, putDocument} from "./api/put.js";
import {deleteKey, getDeleteKeySchema} from "./api/deleteKey.js";
import {deleteDocuments, getDeleteDocumentsSchema} from "./api/deleteDocuments.js";
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
import * as Metrics from "./utils/Metrics.js";
import {METRICS, METRIC_ALL_ROUTES, METRIC_ALL_WS_OPS} from "./utils/constants.js";

const server = fastify({
    logger: createFastifyLogger(),
    trustProxy: true,
    genReqId: () => crypto.randomUUID()
});

// Make logger available globally for non-request contexts
global.logger = server.log;

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    Metrics.countEvent(METRICS.REQUEST, METRIC_ALL_ROUTES, "uncaught_exception");
    server.log.fatal({
        err: {
            type: error.name,
            message: error.message,
            stack: error.stack
        }
    }, 'Uncaught exception');
    await Metrics.flush().catch(console.error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
    Metrics.countEvent(METRICS.REQUEST, METRIC_ALL_ROUTES, "unhandled_rejection");
    server.log.fatal({
        err: {
            type: reason?.name || 'UnhandledRejection',
            message: reason?.message || String(reason),
            stack: reason?.stack
        }
    }, 'Unhandled promise rejection');
    await Metrics.flush().catch(console.error);
    process.exit(1);
});

server.register(websocket, {
    options: {maxPayload: 1048576}
});

/* Registering a websocket handler. */
server.register(async function (fastify) {
    fastify.get('/ws/', {websocket: true}, (socket /* SocketStream */, req /* FastifyRequest */) => {
        // Track WebSocket connection opened
        Metrics.countEvent(METRICS.WEBSOCKET, "connection", "opened");

        // WebSocket heartbeat mechanism for connection health monitoring
        let isAlive = true;

        socket.on('pong', () => {
            isAlive = true;
        });

        // Send ping every 30 seconds to detect dead connections
        const heartbeat = setInterval(() => {
            if (!isAlive) {
                fastify.log.warn('WebSocket connection unresponsive, terminating');
                clearInterval(heartbeat);
                Metrics.countEvent(METRICS.WEBSOCKET, "connection", "timeout");
                return socket.terminate();
            }
            isAlive = false;
            socket.ping();
        }, 30000);

        // Clean up heartbeat interval on connection close
        socket.on('close', () => {
            clearInterval(heartbeat);
            Metrics.countEvent(METRICS.WEBSOCKET, "connection", "closed");
        });

        // Handle incoming messages
        socket.on('message', async message => {
            const messageStartTime = Date.now();
            let parsedMessage;

            try {
                parsedMessage = JSON.parse(message);
                const operationType = parsedMessage.fn || 'unknown';

                const response = await processesMessage(parsedMessage, req.log);

                const messageDuration = Date.now() - messageStartTime;
                const isSuccess = response.response?.isSuccess !== false;

                // Track per-operation metrics
                Metrics.valueEvent(METRICS.WEBSOCKET, operationType, "latency_ms", messageDuration);
                Metrics.countEvent(METRICS.WEBSOCKET, operationType, isSuccess ? "success" : "failure");

                // Aggregate WebSocket operation metrics
                Metrics.valueEvent(METRICS.WEBSOCKET, METRIC_ALL_WS_OPS, "latency_ms", messageDuration);
                Metrics.countEvent(METRICS.WEBSOCKET, METRIC_ALL_WS_OPS, isSuccess ? "success" : "failure");

                socket.send(JSON.stringify(response));
            } catch (error) {
                const messageDuration = Date.now() - messageStartTime;
                Metrics.countEvent(METRICS.WEBSOCKET, "error", "parse_error");
                Metrics.valueEvent(METRICS.WEBSOCKET, METRIC_ALL_WS_OPS, "latency_ms", messageDuration);
                Metrics.countEvent(METRICS.WEBSOCKET, METRIC_ALL_WS_OPS, "failure");

                fastify.log.error({
                    err: {
                        type: error.name,
                        message: error.message,
                        stack: error.stack
                    },
                    reqId: req.id
                }, 'WebSocket message processing error');

                socket.send(JSON.stringify({
                    error: 'Internal server error',
                    message: error.message
                }));
            }
        });
    });
});

/* Request timing hook for latency measurement */
server.addHook('onRequest', (request, reply, done) => {
    request.startTime = Date.now();
    done();
});

/* Adding an authentication hook to the server. A hook is a function that is called when a request is made to
the server. */
server.addHook('onRequest', (request, reply, done) => {
    if (!isAuthenticated(request, reply)) {
        Metrics.countEvent(METRICS.AUTH, "request", "failure");
        reply.code(HTTP_STATUS_CODES.UNAUTHORIZED);
        done(new Error('Wrong key'));
    } else {
        Metrics.countEvent(METRICS.AUTH, "request", "success");
        done();
    }
});

/* Response metrics hook */
server.addHook('onResponse', (request, reply, done) => {
    const duration = Date.now() - request.startTime;
    const route = request.routeOptions?.url || 'unknown';
    const statusLabel = `${Math.floor(reply.statusCode / 100)}xx`;
    const resultLabel = reply.statusCode < 400 ? "success" : "failure";

    Metrics.valueEvent(METRICS.REQUEST, route, "latency_ms", duration);
    Metrics.countEvent(METRICS.REQUEST, route, statusLabel);
    Metrics.countEvent(METRICS.REQUEST, route, resultLabel);

    Metrics.valueEvent(METRICS.REQUEST, METRIC_ALL_ROUTES, "latency_ms", duration);
    Metrics.countEvent(METRICS.REQUEST, METRIC_ALL_ROUTES, statusLabel);
    Metrics.countEvent(METRICS.REQUEST, METRIC_ALL_ROUTES, resultLabel);
    done();
});

/* Custom error handler to log all errors at ERROR level for Elasticsearch */
server.setErrorHandler(function (error, request, reply) {
    const statusCode = error.statusCode || 500;
    const route = request.routeOptions?.url || 'unknown';

    // Track error metrics
    Metrics.countEvent(METRICS.REQUEST, route, "error");
    Metrics.countEvent(METRICS.REQUEST, METRIC_ALL_ROUTES, "error");
    if (statusCode >= 500) {
        Metrics.countEvent(METRICS.REQUEST, route, "5xx_error");
        Metrics.countEvent(METRICS.REQUEST, METRIC_ALL_ROUTES, "5xx_error");
    }

    // Log the error at ERROR level with full context
    this.log.error({
        err: {
            type: error.name,
            message: error.message,
            stack: error.stack
        },
        reqId: request.id,
        req: {
            method: request.method,
            url: request.url,
            hostname: request.hostname,
            remoteAddress: request.ip
        },
        statusCode: statusCode
    }, error.message || 'Request error');

    // Send appropriate error response
    reply.code(statusCode).send({
        error: error.name,
        message: error.message,
        statusCode: statusCode
    });
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
server.post('/deleteDocuments', getDeleteDocumentsSchema(), function (request, reply) {
    return deleteDocuments(request, reply);
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

        if (!LibMySql.init(configs.mysql, global.logger)) {
            throw new Error('Exception occurred while connecting to DB');
        }
    } catch (e) {
        server.log.error(e);
        process.exit(1);
    }
}

/**
 * It starts the server and listens on the port specified in the configs
 */
export async function startServer(configs) {
    try {
        // Initialize metrics (will be no-op in dev/test)
        if (configs.metrics) {
            Metrics.init(
                configs.serviceName || 'cocodb',
                configs.stage,
                configs.metrics.endpoint,
                configs.metrics.apiKey
            );
        }
        init(configs.authKey);
        await server.listen({port: configs.port, host: configs.allowPublicAccess ? '0.0.0.0' : 'localhost'});
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

export async function close() {
    await Metrics.flush().catch(console.error);
    await server.close();
    LibMySql.close();
}

export async function startDB() {
    const serverConfigs = getConfigs();
    await startServer(serverConfigs);
    await initMysql(serverConfigs);
}
