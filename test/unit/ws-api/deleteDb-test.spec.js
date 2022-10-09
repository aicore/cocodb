/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {deleteDb} from "../../../src/ws-api/deleteDb.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let expect = chai.expect;
describe('unit test for create database tests', function () {
    it('delete database should pass', async function () {
        const response = await deleteDb(
            {
                databaseName: 'hello'
            }
        );
        expect(response.isSuccess).to.eql(true);
    });
    it('delete database should fail', async function () {
        const saveExecute = LibMySql.deleteDataBase;
        LibMySql.deleteDataBase = async function (_databaseName) {
            throw new Error('error');
        };
        const response = await deleteDb(
            {
                databaseName: 'hello'
            }
        );
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.deleteDataBase = saveExecute;
    });
    it('processMessage  for deleteDb should pass', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.deleteDb,
            id: '1',
            request: {
                databaseName: 'hello'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.deleteDb);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
    });
    it('processMessage should fail if there is typo in database name', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.deleteDb,
            id: '1',
            request: {
                dataBaseName: 'hello'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.deleteDb);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('processMessage should fail if response validation fails', async function () {
        const saveExecute = LibMySql.deleteDataBase;
        LibMySql.deleteDataBase = async function (tableName) {
            return new Promise( resolve => {

                resolve({

                });
            });
        };
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.deleteDb,
            id: '1',
            request: {
                databaseName: 'hello'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.deleteDb);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('server did not send valid data');
        LibMySql.deleteDataBase = saveExecute;
    });
});

