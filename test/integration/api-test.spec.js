// Testing framework: Mocha , assertion style: chai
// See https://mochajs.org/#getting-started on how to write tests
// Use chai for BDD style assertions (expect, should etc..). See move here: https://www.chaijs.com/guide/styles/#expect

// Mocks and spies: sinon
// if you want to mock/spy on fn() for unit tests, use sinon. refer docs: https://sinonjs.org/

// Note on coverage suite used here:
// we use c8 for coverage https://github.com/bcoe/c8. Its reporting is based on nyc, so detailed docs can be found
// here: https://github.com/istanbuljs/nyc ; We didn't use nyc as it do not yet have ES module support
// see: https://github.com/digitalbazaar/bedrock-test/issues/16 . c8 is drop replacement for nyc coverage reporting tool

// remove integration tests if you don't have them.
// jshint ignore: start
/*global describe, it, before, after, beforeEach, afterEach*/

import * as assert from 'assert';
import * as chai from 'chai';
import {getConfigs} from "./setupIntegTest.js";
import fs from "fs";
import {close, startDB} from "../../src/server.js";
import {
    createIndex,
    createTable,
    deleteDocument,
    deleteTable,
    get,
    getFromIndex, getFromNonIndex,
    hello,
    init,
    put, update
} from "@aicore/coco-db-client";

let expect = chai.expect;
const CONFIG_FILE = process.cwd() + '/conf.json';
const TABLE_NAME = 'customers';
describe('Integration: Hello world Tests', function () {
    before(async function () {
        const configs = await getConfigs();

        fs.appendFileSync(CONFIG_FILE, JSON.stringify(configs));
        process.env.APP_CONFIG = CONFIG_FILE;
        startDB();
        console.log('starting integ tests');
        init(`http://localhost:${configs.port}`, configs.authKey);

    });
    after(function () {
        fs.unlinkSync(CONFIG_FILE);
        close();
    });
    beforeEach(async function () {
        await createTable(TABLE_NAME);
    });
    afterEach(async function () {
        await deleteTable(TABLE_NAME);
    });


    describe('#indexOf()', function () {
        it('test hello', async function () {
            const response = await hello();
            expect(response.hello).eql('world');
        });
        it('put and get and delete to table should pass', async function () {
            const document = {
                'lastName': 'Alice',
                'Age': 100,
                'active': true,
                'location': {
                    'city': 'Banglore',
                    'state': 'Karnataka',
                    'layout': {
                        'block': '1stblock'
                    }

                }
            };
            const putResp = await put(TABLE_NAME, document);
            expect(putResp.isSuccess).eql(true);
            expect(putResp.documentId.length).gt(10);
            const getResp = await get(TABLE_NAME, putResp.documentId);
            expect(getResp.isSuccess).eql(true);
            expect(getResp.document.lastName).eql('Alice');
            expect(getResp.document.Age).eql(100);
            expect(getResp.document.location.city).eql('Banglore');
            expect(getResp.document.location.state).eql('Karnataka');
            expect(getResp.document.location.layout.block).eql('1stblock');
            const delResp = await deleteDocument(TABLE_NAME, putResp.documentId);
            expect(delResp.isSuccess).eql(true);

        });
        it('createIndex should pass', async function () {
            const document = {
                id: '12345',
                'lastName': 'Alice',
                'Age': 100,
                'active': true,
                'location': {
                    'city': 'Banglore',
                    'state': 'Karnataka',
                    'layout': {
                        'block': '1stblock'
                    }

                }
            };
            const putResp = await put(TABLE_NAME, document);
            expect(putResp.isSuccess).eql(true);
            expect(putResp.documentId.length).gt(10);
            const createIndexResp = await createIndex(TABLE_NAME, 'Age', 'INT');
            expect(createIndexResp.isSuccess).eql(true);
            const getFromIndexResp = await getFromIndex(TABLE_NAME, {
                'Age': 100
            });
            expect(getFromIndexResp.isSuccess).eql(true);
            expect(getFromIndexResp.documents[0].id).eql('12345');
            expect(getFromIndexResp.documents[0].lastName).eql('Alice');
            expect(getFromIndexResp.documents[0].Age).eql(100);
            expect(getFromIndexResp.documents[0].location.city).eql('Banglore');
            expect(getFromIndexResp.documents[0].location.state).eql('Karnataka');
            expect(getFromIndexResp.documents[0].location.layout.block).eql('1stblock');
        });
        it('create unique index test', async function () {
            const document = {
                id: '12345',
                'lastName': 'Alice',
                'Age': 100,
                'active': true,
                'location': {
                    'city': 'Banglore',
                    'state': 'Karnataka',
                    'layout': {
                        'block': '1stblock'
                    }

                }
            };
            const putResp = await put(TABLE_NAME, document);
            expect(putResp.isSuccess).eql(true);
            const docId = putResp.documentId;
            expect(docId.length).gt(10);
            const createIndexResp = await createIndex(TABLE_NAME, 'id', 'VARCHAR(50)', true, true);
            expect(createIndexResp.isSuccess).eql(true);
            const newPutResp = await put(TABLE_NAME, document);
            expect(newPutResp.isSuccess).eql(false);
            expect(newPutResp.errorMessage).eql("Error: Duplicate entry '12345' for key 'customers.b80bb7740288fda1f201890375a60c8f'");
        });
        it('getFromNonIndex test should pass', async function () {
            const document = {
                id: '12345',
                'lastName': 'Alice',
                'Age': 100,
                'active': true,
                'location': {
                    'city': 'Banglore',
                    'state': 'Karnataka',
                    'layout': {
                        'block': '1stblock'
                    }

                }
            };
            await put(TABLE_NAME, document);
            await put(TABLE_NAME, document);
            const scanResults = await getFromNonIndex(TABLE_NAME, {
                location: {
                    layout: {
                        block: '1stblock'
                    }
                }
            });
            expect(scanResults.isSuccess).eql(true);
            expect(scanResults.documents.length).eql(2);
            expect(scanResults.documents[0].id).eql('12345');
            expect(scanResults.documents[0].lastName).eql('Alice');
            expect(scanResults.documents[0].Age).eql(100);
            expect(scanResults.documents[0].location.city).eql('Banglore');
            expect(scanResults.documents[0].location.state).eql('Karnataka');
            expect(scanResults.documents[0].location.layout.block).eql('1stblock');
            expect(scanResults.documents[1].id).eql('12345');
            expect(scanResults.documents[1].lastName).eql('Alice');
            expect(scanResults.documents[1].Age).eql(100);
            expect(scanResults.documents[1].location.city).eql('Banglore');
            expect(scanResults.documents[1].location.state).eql('Karnataka');
            expect(scanResults.documents[1].location.layout.block).eql('1stblock');

            const emptyResults = await getFromNonIndex(TABLE_NAME, {
                location: {
                    layout: {
                        block: '2ndblock'
                    }
                }
            });
            expect(emptyResults.isSuccess).eql(true);
            expect(emptyResults.documents.length).eql(0);
        });

        it('update document should pass', async function () {
            const document = {
                id: '12345',
                'lastName': 'Alice',
                'Age': 100,
                'active': true,
                'location': {
                    'city': 'Banglore',
                    'state': 'Karnataka',
                    'layout': {
                        'block': '1stblock'
                    }

                }
            };
            const putResp = await put(TABLE_NAME, document);
            document.lastName = 'bob';
            const updateResponse = await update(TABLE_NAME, putResp.documentId, document);
            expect(updateResponse.isSuccess).eql(true);
            const getResponse = await get(TABLE_NAME, putResp.documentId);
            expect(getResponse.isSuccess).eql(true);
            expect(getResponse.document.lastName).eql('bob');
            expect(getResponse.document.Age).eql(100);
            expect(getResponse.document.location.city).eql('Banglore');
            expect(getResponse.document.location.state).eql('Karnataka');
            expect(getResponse.document.location.layout.block).eql('1stblock');

        });
        it('make 1500 writes followed by read and delete', async function () {
            await writeAndReadFromDb(1500);
        });

    });
});


async function writeAndReadFromDb(numberOfTimes) {
    const document = {
        id: '12345',
        'lastName': 'Alice',
        'Age': 100,
        'active': true,
        'location': {
            'city': 'Banglore',
            'state': 'Karnataka',
            'layout': {
                'block': '1stblock'
            }

        }
    };
    const putPromises = [];
    for (let i = 0; i < numberOfTimes; i++) {
        let putResp = put(TABLE_NAME, document);
        putPromises.push(putResp);
    }
    const putResults = await Promise.all(putPromises);
    putResults.forEach(result => {
        expect(result.isSuccess).eql(true);
    });
    const getPromises = [];
    for (const resp of putResults) {
        let getResponse = get(TABLE_NAME, resp.documentId);
        getPromises.push(getResponse);
    }
    const results = await Promise.all(getPromises);
    expect(results.length).eql(numberOfTimes);
    results.forEach(result => {
        expect(result.isSuccess).eql(true);
        expect(result.document.lastName).eql('Alice');
        expect(result.document.Age).eql(100);
        expect(result.document.location.city).eql('Banglore');
        expect(result.document.location.state).eql('Karnataka');
        expect(result.document.location.layout.block).eql('1stblock');
    });

    const deletePromises = [];
    putResults.forEach(result => {
        let promise = deleteDocument(TABLE_NAME, result.documentId);
        deletePromises.push(promise);

    });

    const deleteResults = await Promise.all(deletePromises);

    deleteResults.forEach(result => {
        expect(result.isSuccess).eql(true);
    });
}
