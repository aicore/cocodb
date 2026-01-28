/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {listTables} from "../../../src/ws-api/listTables.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";

let expect = chai.expect;

describe('unit test for list tables tests (ws-api)', function () {
    it('list tables should pass', async function () {
        const response = await listTables({
            databaseName: 'test'
        });
        expect(response.isSuccess).to.eql(true);
        expect(response.tables).to.be.an('array');
        expect(response.tables).to.include('customers');
        expect(response.tables).to.include('orders');
    });

    it('should fail when LibMySql.listTables throws', async function () {
        const saveExecute = LibMySql.listTables;
        LibMySql.listTables = async function (databaseName) {
            throw new Error('error');
        };
        const response = await listTables({
            databaseName: 'test'
        });
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.listTables = saveExecute;
    });

    it('processMessage should pass', async function () {
        const resp = await processesMessage({
            fn: 'listTables',
            id: '1',
            request: {
                databaseName: 'test'
            }
        });
        expect(resp.fn).eql('listTables');
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
        expect(resp.response.tables).to.be.an('array');
    });

    it('processMessage should fail if databaseName is missing', async function () {
        const resp = await processesMessage({
            fn: 'listTables',
            id: '1',
            request: {}
        });
        expect(resp.fn).eql('listTables');
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('processMessage should fail if response validation fails', async function () {
        const saveExecute = LibMySql.listTables;
        LibMySql.listTables = async function (databaseName) {
            return new Promise(resolve => {
                resolve({});
            });
        };
        const resp = await processesMessage({
            fn: 'listTables',
            id: '1',
            request: {
                databaseName: 'test'
            }
        });
        expect(resp.fn).eql('listTables');
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('server did not send valid data');
        LibMySql.listTables = saveExecute;
    });
});
