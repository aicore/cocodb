/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {deleteDocument} from "../../../src/ws-api/deleteDocument.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let expect = chai.expect;
describe('unit test for deleteDocument tests', function () {
    it('deleteDocument should pass', async function () {
        const response = await deleteDocument(
            {
                tableName: 'hello.x',
                documentId :'123'
            }
        );
        expect(response.isSuccess).to.eql(true);
    });
    it('deleteDocument with condition should pass', async function () {
        const response = await deleteDocument(
            {
                tableName: 'hello.x',
                documentId:'123',
                condition: "$.x=10"
            }
        );
        expect(response.isSuccess).to.eql(true);
    });
    it('deleteDocument should fail', async function () {
        const saveExecute = LibMySql.deleteKey;
        LibMySql.deleteKey = async function (_tableName) {
            throw new Error('error');
        };
        const response = await deleteDocument(
            {
                tableName: 'hello.x',
                documentId :'123'
            }
        );
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.deleteKey = saveExecute;
    });
    it('processMessage should pass for deleteDocument', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.deleteDocument,
            id: '1',
            request: {
                tableName: 'hello.x',
                documentId :'123'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.deleteDocument);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
    });
    it('deleteDocument processMessage should fail if required parameters are missing name', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.deleteDocument,
            id: '1',
            request: {
                tablename: 'hello.x'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.deleteDocument);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('processMessage should fail if response validation fails', async function () {
        const saveExecute = LibMySql.deleteKey;
        LibMySql.deleteKey = async function (_tableName, _documentId){
            return new Promise(resolve => {

                resolve({});
            });
        };
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.deleteDocument,
            id: '1',
            request: {
                tableName: 'hello.x',
                documentId :'123'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.deleteDocument);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('server did not send valid data');
        LibMySql.deleteKey = saveExecute;
    });
});

