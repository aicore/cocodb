/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {createDb} from "../../../src/ws-api/createDb.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let expect = chai.expect;
describe('unit test for create database tests', function () {
    it('create database should pass', async function () {
        const response = await createDb(
            {
                databaseName: 'hello'
            }
        );
        expect(response.isSuccess).to.eql(true);
    });
    it('should fail', async function () {
        const saveExecute = LibMySql.createDataBase;
        LibMySql.createDataBase = async function (tableName) {
            throw new Error('error');
        };
        const response = await createDb(
            {
                databaseName: 'hello'
            }
        );
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.createDataBase = saveExecute;
    });
    it('processMessage should pass', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.createDb,
            id: '1',
            request: {
                databaseName: 'hello'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.createDb);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
    });
    it('processMessage should fail if there is typo in database name', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.createDb,
            id: '1',
            request: {
                dataBaseName: 'hello'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.createDb);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });
});

