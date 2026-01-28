/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {getTableIndexes} from "../../../src/ws-api/getTableIndexes.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";

let expect = chai.expect;

describe('unit test for get table indexes tests (ws-api)', function () {
    it('get table indexes should pass', async function () {
        const response = await getTableIndexes({
            tableName: 'test.customers'
        });
        expect(response.isSuccess).to.eql(true);
        expect(response.indexes).to.be.an('array');
        expect(response.indexes.length).to.be.greaterThan(0);
        expect(response.indexes[0].indexName).eql('PRIMARY');
        expect(response.indexes[0].isPrimary).eql(true);
    });

    it('should fail when LibMySql.getTableIndexes throws', async function () {
        const saveExecute = LibMySql.getTableIndexes;
        LibMySql.getTableIndexes = async function (tableName) {
            throw new Error('error');
        };
        const response = await getTableIndexes({
            tableName: 'test.customers'
        });
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.getTableIndexes = saveExecute;
    });

    it('processMessage should pass', async function () {
        const resp = await processesMessage({
            fn: 'getTableIndexes',
            id: '1',
            request: {
                tableName: 'test.customers'
            }
        });
        expect(resp.fn).eql('getTableIndexes');
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
        expect(resp.response.indexes).to.be.an('array');
    });

    it('processMessage should fail if tableName is missing', async function () {
        const resp = await processesMessage({
            fn: 'getTableIndexes',
            id: '1',
            request: {}
        });
        expect(resp.fn).eql('getTableIndexes');
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('processMessage should fail if response validation fails', async function () {
        const saveExecute = LibMySql.getTableIndexes;
        LibMySql.getTableIndexes = async function (tableName) {
            return new Promise(resolve => {
                resolve({});
            });
        };
        const resp = await processesMessage({
            fn: 'getTableIndexes',
            id: '1',
            request: {
                tableName: 'test.customers'
            }
        });
        expect(resp.fn).eql('getTableIndexes');
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('server did not send valid data');
        LibMySql.getTableIndexes = saveExecute;
    });
});
