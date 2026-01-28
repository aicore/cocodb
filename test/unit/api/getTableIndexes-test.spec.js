/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {getTableIndexes, getGetTableIndexesSchema} from "../../../src/api/getTableIndexes.js";

let expect = chai.expect;

describe('unit test for get table indexes tests', function () {
    it('get table indexes should pass', async function () {
        const response = await getTableIndexes({
            query: {
                tableName: 'test.customers'
            },
            log: {
                error: function (msg) {},
                info: function (msg) {}
            }
        }, {});
        expect(response.isSuccess).to.eql(true);
        expect(response.indexes).to.be.an('array');
        expect(response.indexes.length).to.be.greaterThan(0);
        expect(response.indexes[0].indexName).eql('PRIMARY');
        expect(response.indexes[0].columnName).eql('documentID');
        expect(response.indexes[0].isPrimary).eql(true);
    });

    it('should fail when LibMySql.getTableIndexes throws', async function () {
        const saveExecute = LibMySql.getTableIndexes;
        LibMySql.getTableIndexes = async function (tableName) {
            throw new Error('error');
        };
        const response = await getTableIndexes({
            query: {
                tableName: 'test.customers'
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
        LibMySql.getTableIndexes = saveExecute;
    });

    it('getTableIndexes schema', function () {
        const schema = getGetTableIndexesSchema();
        expect(schema.schema.querystring.required[0]).eql('tableName');
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[200].properties.indexes.type).eql('array');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');
    });
});
