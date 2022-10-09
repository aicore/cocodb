/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {get} from "../../../src/ws-api/get.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let expect = chai.expect;
describe('unit test for create database tests', function () {
    it('get should pass', async function () {
        const response = await get(
            {
                tableName: 'hello.x',
                documentId: '123'
            }
        );
        expect(response.isSuccess).to.eql(true);
        expect(response.document.hello).eql('world');
    });
    it('deleteDocument should fail', async function () {
        const saveExecute = LibMySql.get;
        LibMySql.get = async function (_tableName) {
            throw new Error('error');
        };
        const response = await get(
            {
                tableName: 'hello.x',
                documentId: '123'
            }
        );
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.get = saveExecute;
    });
    it('processMessage should pass for get', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.get,
            id: '1',
            request: {
                tableName: 'hello.x',
                documentId: '123'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.get);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
        expect(resp.response.document.hello).eql('world');
    });
    it('get processMessage should fail if required parameters are missing name', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.get,
            id: '1',
            request: {
                tablename: 'hello.x'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.get);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('processMessage should fail if response validation fails for get api', async function () {
        const saveExecute = LibMySql.get;
        LibMySql.get = async function (_tableName, _documentId) {
            return new Promise(resolve => {

                resolve(true);
            });
        };
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.get,
            id: '1',
            request: {
                tableName: 'hello.x',
                documentId: '123'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.get);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('server did not send valid data');
        LibMySql.get = saveExecute;
    });
});

