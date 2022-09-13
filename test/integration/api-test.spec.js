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
/*global describe, it, before, after*/

import * as assert from 'assert';
import * as chai from 'chai';
import {getConfigs} from "./setupIntegTest.js";
import fs from "fs";
import {close, startDB} from "../../src/server.js";
import {hello, init} from "@aicore/coco-db-client";

let expect = chai.expect;

describe('Integration: Hello world Tests', function () {
    before(async function () {
        const configs = await getConfigs();
        const configFile = process.cwd() + '/conf.json';
        fs.appendFileSync(configFile, JSON.stringify(configs));
        process.env.APP_CONFIG = configFile;
        console.log(`${JSON.stringify(configs)}`);
        startDB();
        console.log('starting integ tests');
        init(`http://localhost:${configs.port}`, configs.authKey);

    });
    after(function () {
        close();
    });


    describe('#indexOf()', function () {
        it('test hello', async function () {
            const response = await hello();
            expect(response.hello).eql('world');
        });
    });
});
