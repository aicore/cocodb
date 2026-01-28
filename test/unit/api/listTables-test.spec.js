/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {listTables, getListTablesSchema} from "../../../src/api/listTables.js";

let expect = chai.expect;

describe('unit test for list tables tests', function () {
    it('list tables should pass', async function () {
        const response = await listTables({
            query: {
                databaseName: 'test'
            },
            log: {
                error: function (msg) {},
                info: function (msg) {}
            }
        }, {});
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
            query: {
                databaseName: 'test'
            },
            log: {
                error: function (msg) {},
                info: function (msg) {}
            }
        }, {
            code: function (code) {}
        });
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.listTables = saveExecute;
    });

    it('listTables schema', function () {
        const schema = getListTablesSchema();
        expect(schema.schema.querystring.required[0]).eql('databaseName');
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[200].properties.tables.type).eql('array');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');
    });
});
