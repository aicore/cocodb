/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {hello} from "../../../src/ws-api/hello.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let expect = chai.expect;
describe('unit test for create database tests', function () {
    it('create database should pass', function () {
        const response = hello();
        expect(response.hello).to.eql('world');
    });
    it('processMessage should pass', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.hello,
            id: '1',
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.hello);
        expect(resp.id).eql('1');
        expect(resp.response.hello).eql('world');
    });

});

