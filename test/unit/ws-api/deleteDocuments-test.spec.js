/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {deleteDocuments} from "../../../src/ws-api/deleteDocuments.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let expect = chai.expect;
describe('unit test for deleteDocuments tests', function () {
    it('deleteDocuments should pass', async function () {
        const saveExecute = LibMySql.deleteDocuments;
        let tableName, queryString, useIndexFields;
        LibMySql.deleteDocuments = async function (_tableName, _queryString, _useIndexForFields) {
            tableName = _tableName; queryString = _queryString; useIndexFields = _useIndexForFields;
            return 42;
        };
        const response = await deleteDocuments(
            {
                tableName: 'hello.x',
                queryString: '123'
            }
        );
        expect(response.isSuccess).to.eql(true);
        expect(response.deleteCount).to.eql(42);
        expect(tableName).to.eql('hello.x');
        expect(queryString).to.eql('123');
        expect(useIndexFields).to.not.exist;
        LibMySql.deleteDocuments = saveExecute;
    });
    it('deleteDocuments should pass with index', async function () {
        const saveExecute = LibMySql.deleteDocuments;
        let tableName, queryString, useIndexFields;
        LibMySql.deleteDocuments = async function (_tableName, _queryString, _useIndexForFields) {
            tableName = _tableName; queryString = _queryString; useIndexFields = _useIndexForFields;
            return 42;
        };
        const response = await deleteDocuments(
            {
                tableName: 'hello.x',
                queryString: '123',
                useIndexForFields: ['a', 'b']
            }
        );
        expect(response.isSuccess).to.eql(true);
        expect(response.deleteCount).to.eql(42);
        expect(tableName).to.eql('hello.x');
        expect(queryString).to.eql('123');
        expect(useIndexFields).to.eql(['a', 'b']);
        LibMySql.deleteDocuments = saveExecute;
    });
    it('deleteDocument should fail', async function () {
        const saveExecute = LibMySql.deleteDocuments;
        LibMySql.deleteDocuments = async function (_tableName) {
            throw new Error('error');
        };
        const response = await deleteDocuments(
            {
                tableName: 'hello.x',
                documentId :'123'
            }
        );
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.deleteDocuments = saveExecute;
    });
    it('processMessage should pass for deleteDocuments', async function () {
        const saveExecute = LibMySql.deleteDocuments;
        LibMySql.deleteDocuments = async function () {
            return 42;
        };
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.deleteDocuments,
            id: '1',
            request: {
                tableName: 'hello.x',
                queryString: '123',
                useIndexForFields: ['a', 'b']
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.deleteDocuments);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
        LibMySql.deleteDocuments = saveExecute;
    });
    it('deleteTable processMessage should fail if required parameters are missing name', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.deleteDocuments,
            id: '1',
            request: {
                tablename: 'hello.x'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.deleteDocuments);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('processMessage should fail if response validation fails', async function () {
        const saveExecute = LibMySql.deleteDocuments;
        LibMySql.deleteDocuments = async function (_tableName, _documentId){
            return new Promise(resolve => {
                resolve({});
            });
        };
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.deleteDocuments,
            id: '1',
            request: {
                tableName: 'hello.x',
                queryString: '123',
                useIndexForFields: ['a', 'b']
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.deleteDocuments);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('server did not send valid data');
        LibMySql.deleteDocuments = saveExecute;
    });
});

