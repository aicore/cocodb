/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {listDatabases} from "../../../src/ws-api/listDatabases.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";

let expect = chai.expect;

describe('unit test for list databases tests (ws-api)', function () {
    it('list databases should pass', async function () {
        const response = await listDatabases({});
        expect(response.isSuccess).to.eql(true);
        expect(response.databases).to.be.an('array');
        expect(response.databases).to.include('test');
        expect(response.databases).to.include('mysql');
    });

    it('should fail when LibMySql.listDatabases throws', async function () {
        const saveExecute = LibMySql.listDatabases;
        LibMySql.listDatabases = async function () {
            throw new Error('error');
        };
        const response = await listDatabases({});
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.listDatabases = saveExecute;
    });

    it('processMessage should pass', async function () {
        const resp = await processesMessage({
            fn: 'listDatabases',
            id: '1',
            request: {}
        });
        expect(resp.fn).eql('listDatabases');
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
        expect(resp.response.databases).to.be.an('array');
    });

    it('processMessage should fail if response validation fails', async function () {
        const saveExecute = LibMySql.listDatabases;
        LibMySql.listDatabases = async function () {
            return new Promise(resolve => {
                resolve({});
            });
        };
        const resp = await processesMessage({
            fn: 'listDatabases',
            id: '1',
            request: {}
        });
        expect(resp.fn).eql('listDatabases');
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('server did not send valid data');
        LibMySql.listDatabases = saveExecute;
    });
});
