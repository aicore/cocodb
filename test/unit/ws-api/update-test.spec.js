/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {update} from "../../../src/ws-api/update.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let expect = chai.expect;
describe('unit test for update tests', function () {
    it('update should pass', async function () {
        const response = await update(
            {
                tableName: 'hello.x',
                documentId: '12345',
                document: {
                    x: 1
                }

            }
        );
        expect(response.isSuccess).to.eql(true);
        expect(response.documentId).eql('12345');
    });
    it('update should fail', async function () {
        const saveExecute = LibMySql.update;
        LibMySql.update = async function (_tableName, _documentId, _document) {
            throw new Error('error');
        };
        const response = await update(
            {
                tableName: 'hello.x',
                documentId: '12345',
                document: {
                    x: 1
                }

            }
        );
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.update = saveExecute;
    });
    it('processMessage should pass for update', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.update,
            id: '1',
            request: {
                tableName: 'hello.x',
                documentId: '12345',
                document: {
                    x: 1
                }

            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.update);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
        expect(resp.response.documentId).eql('12345');
    });
    it('processMessage should pass for conditional update', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.update,
            id: '1',
            request: {
                tableName: 'hello.x',
                documentId: '12345',
                document: {
                    x: 1
                },
                condition: "$.x<10"

            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.update);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
        expect(resp.response.documentId).eql('12345');
    });
    it('update processMessage should fail if required parameters are missing name', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.update,
            id: '1',
            request: {
                tablename: 'hello.x',
                documentId: '12345',
                document: {
                    x: 1
                }
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.update);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });
    it('update processMessage should fail if condition parameter type is not string', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.update,
            id: '1',
            request: {
                tableName: 'hello.x',
                documentId: '12345',
                document: {
                    x: 1
                },
                condition: 10

            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.update);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('processMessage should fail if response validation fails for put api', async function () {
        const saveExecute = LibMySql.put;
        LibMySql.update = async function (_tableName,_documetId, _document) {
            return new Promise(resolve => {

                resolve({});
            });
        };
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.update,
            id: '1',
            request: {
                tableName: 'hello.x',
                documentId: '12345',
                document: {
                    x: 1
                }
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.update);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('server did not send valid data');
        LibMySql.update = saveExecute;
    });
});

