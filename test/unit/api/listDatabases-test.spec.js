/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {listDatabases, getListDatabasesSchema} from "../../../src/api/listDatabases.js";

let expect = chai.expect;

describe('unit test for list databases tests', function () {
    it('list databases should pass', async function () {
        const response = await listDatabases({
            log: {
                error: function (msg) {},
                info: function (msg) {}
            }
        }, {});
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
        const response = await listDatabases({
            log: {
                error: function (msg) {},
                info: function (msg) {}
            }
        }, {
            code: function (code) {}
        });
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.listDatabases = saveExecute;
    });

    it('listDatabases schema', function () {
        const schema = getListDatabasesSchema();
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[200].properties.databases.type).eql('array');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');
    });
});
