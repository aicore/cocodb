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
/*global describe, it, before, after, beforeEach*/

import * as assert from 'assert';
import * as chai from 'chai';
import {getConfigs} from "./setupIntegTest.js";
import fs from "fs";
import {close, startDB} from "../../src/server.js";
import {createTable, deleteDocument, deleteTable, get, hello, init, put} from "@aicore/coco-db-client";

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
    });
});
