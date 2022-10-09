/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {createIndex} from '../../../src/ws-api/createIndex.js';
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let expect = chai.expect;
describe('unit test for create database tests', function () {
    it('create database should pass', async function () {
        const response = await createIndex(
            {
                tableName: 'hello.x',
                jsonField: 'x.y',
                dataType: 'INT'
            }
        );
        expect(response.isSuccess).to.eql(true);
    });
    it('should fail', async function () {
        const saveExecute = LibMySql.createDataBase;
        LibMySql.createIndexForJsonField = async function
            (_tableName, _jsonField, _dataType, _isUnique, _isNotNull) {
            throw new Error('error');
        };
        const response = await createIndex(
            {
                tableName: 'hello.x',
                jsonField: 'x.y',
                dataType: 'INT'
            }
        );
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.createIndexForJsonField = saveExecute;
    });
    it('processMessage should pass', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.createIndex,
            id: '1',
            request: {
                tableName: 'hello.x',
                jsonField: 'x.y',
                dataType: 'INT'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.createIndex);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
    });
    it('processMessage should pass with isNotNull and isUnique', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.createIndex,
            id: '1',
            request: {
                tableName: 'hello.x',
                jsonField: 'x.y',
                dataType: 'INT',
                isUnique: true,
                isNotNull: true
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.createIndex);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
    });
    it('processMessage should fail if required parameters are missing name', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.createIndex,
            id: '1',
            request: {
                tableName: 'hello.x',
                jsonField: 'x.y'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.createIndex);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('processMessage should fail if response validation fails', async function () {
        const saveExecute = LibMySql.createIndexForJsonField;
        LibMySql.createIndexForJsonField = async function (_tableName, _jsonField, _dataType,
            _isUnique, _isNotNull) {
            return new Promise(resolve => {

                resolve({});
            });
        };
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.createIndex,
            id: '1',
            request: {
                tableName: 'hello.x',
                jsonField: 'x.y',
                dataType: 'INT'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.createIndex);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('server did not send valid data');
        LibMySql.createIndexForJsonField = saveExecute;
    });
});

