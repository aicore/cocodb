/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {put} from "../../../src/ws-api/put.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let expect = chai.expect;
describe('unit test for put tests', function () {
    it('put should pass', async function () {
        const response = await put(
            {
                tableName: 'hello.x',
                document: {
                    x: 1
                }

            }
        );
        expect(response.isSuccess).to.eql(true);
        expect(response.documentId).eql('12345');
    });
    it('put should fail', async function () {
        const saveExecute = LibMySql.put;
        LibMySql.put = async function (_tableName, _document) {
            throw new Error('error');
        };
        const response = await put(
            {
                tableName: 'hello.x',
                document: {
                    x: 1
                }

            }
        );
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.put = saveExecute;
    });
    it('processMessage should pass for put', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.put,
            id: '1',
            request: {
                tableName: 'hello.x',
                document: {
                    x: 1
                }
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.put);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
        expect(resp.response.documentId).eql('12345');
    });
    it('put processMessage should fail if required parameters are missing name', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.put,
            id: '1',
            request: {
                tablename: 'hello.x',
                document: {
                    x: 1
                }
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.put);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('processMessage should fail if response validation fails for put api', async function () {
        const saveExecute = LibMySql.put;
        LibMySql.put = async function (_tableName, _document) {
            return new Promise(resolve => {

                resolve({});
            });
        };
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.put,
            id: '1',
            request: {
                tableName: 'hello.x',
                document: {
                    x: 1
                }
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.put);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('server did not send valid data');
        LibMySql.mathAdd = saveExecute;
    });
});

