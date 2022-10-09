/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {deleteTable} from "../../../src/ws-api/deleteTable.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let expect = chai.expect;
describe('unit test for create database tests', function () {
    it('deleteTable should pass', async function () {
        const response = await deleteTable(
            {
                tableName: 'hello.x'
            }
        );
        expect(response.isSuccess).to.eql(true);
    });
    it('deleteTable should fail', async function () {
        const saveExecute = LibMySql.deleteTable;
        LibMySql.deleteTable = async function (_tableName) {
            throw new Error('error');
        };
        const response = await deleteTable(
            {
                tableName: 'hello.x'
            }
        );
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.deleteTable = saveExecute;
    });
    it('processMessage should pass for deleteTable', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.deleteTable,
            id: '1',
            request: {
                tableName: 'hello.x'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.deleteTable);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
    });
    it('deleteTable processMessage should fail if required parameters are missing name', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.deleteTable,
            id: '1',
            request: {
                tablename: 'hello.x'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.deleteTable);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('processMessage should fail if response validation fails', async function () {
        const saveExecute = LibMySql.deleteTable;
        LibMySql.deleteTable = async function (_tableName){
            return new Promise(resolve => {

                resolve({});
            });
        };
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.deleteTable,
            id: '1',
            request: {
                tableName: 'hello.x'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.deleteTable);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('server did not send valid data');
        LibMySql.deleteTable = saveExecute;
    });
});

