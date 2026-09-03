/*global describe, it*/
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {query, getQuerySchema} from "../../../src/api/query.js";

let expect = chai.expect;

describe('Ut for query api', function () {

    function _mockRequest(body) {
        return {
            body,
            log: {
                error: function (msg) {
                },
                info: function (msg) {
                }
            }
        };
    }

    const reply = {
        code: function (code) {
        }
    };

    it('query should forward options.orderByIndexedField and useIndexForFields to LibMySql', async function () {
        const saveExecute = LibMySql.query;
        let received;
        LibMySql.query = async function (tableName, queryString, useIndexForFields, options) {
            received = {tableName, queryString, useIndexForFields, options};
            return [{hello: 'world'}];
        };
        const orderBy = {field: 'count', direction: 'DESC'};
        const response = await query(_mockRequest({
            tableName: 'customers',
            queryString: '$.count > 1',
            useIndexForFields: ['count'],
            options: {orderByIndexedField: orderBy, pageOffset: 0, pageLimit: 10}
        }), reply);
        expect(response.isSuccess).eql(true);
        expect(response.documents.length).eql(1);
        expect(received.tableName).eql('customers');
        expect(received.queryString).eql('$.count > 1');
        expect(received.useIndexForFields).eql(['count']);
        expect(received.options.orderByIndexedField).eql(orderBy);
        expect(received.options.pageOffset).eql(0);
        expect(received.options.pageLimit).eql(10);
        LibMySql.query = saveExecute;
    });

    it('query should throw error message in case of failure', async function () {
        const saveExecute = LibMySql.query;
        LibMySql.query = async function () {
            throw new Error('error');
        };
        const response = await query(_mockRequest({
            tableName: 'customers',
            queryString: '$.count > 1'
        }), reply);
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.query = saveExecute;
    });

    it('validate schema', function () {
        const schema = getQuerySchema();
        expect(schema.schema.body.required).eql(['tableName', 'queryString']);
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[200].required[1]).eql('documents');
        const orderBy = schema.schema.body.properties.options.properties.orderByIndexedField;
        expect(orderBy.type).eql('object');
        expect(orderBy.required).eql(['field']);
        expect(orderBy.properties.field.type).eql('string');
        expect(orderBy.properties.direction.enum).eql(['ASC', 'DESC']);
        expect(orderBy.properties.direction.default).eql('ASC');
    });
});
