/*global describe, it*/
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {query} from "../../../src/ws-api/query.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let expect = chai.expect;
describe('unit test for ws query api', function () {
    it('query should pass and forward orderByIndexedField option', async function () {
        const saveExecute = LibMySql.query;
        let received;
        LibMySql.query = async function (tableName, queryString, useIndexForFields, options) {
            received = {tableName, queryString, useIndexForFields, options};
            return [{1: '2'}];
        };
        const response = await query({
            tableName: 'hello.x',
            queryString: '$.count > 1',
            useIndexForFields: ['count'],
            options: {orderByIndexedField: {field: 'count', direction: 'DESC'}}
        });
        expect(response.isSuccess).to.eql(true);
        expect(response.documents[0][1]).eql('2');
        expect(received.useIndexForFields).eql(['count']);
        expect(received.options.orderByIndexedField).eql({field: 'count', direction: 'DESC'});
        LibMySql.query = saveExecute;
    });

    it('query should fail', async function () {
        const saveExecute = LibMySql.query;
        LibMySql.query = async function () {
            throw new Error('error');
        };
        const response = await query({
            tableName: 'hello.x',
            queryString: '$.count > 1'
        }, {error: function () {}});
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.query = saveExecute;
    });

    it('processMessage should pass orderByIndexedField option through to LibMySql for query', async function () {
        const saveExecute = LibMySql.query;
        let receivedOptions;
        LibMySql.query = async function (_tableName, _queryString, _useIndexForFields, options) {
            receivedOptions = options;
            return [{1: '2'}];
        };
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.query,
            id: '1',
            request: {
                tableName: 'hello.x',
                queryString: '$.count > 1',
                options: {
                    orderByIndexedField: {field: 'count'}
                }
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.query);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
        // direction is optional, libmysql defaults it to ASC
        expect(receivedOptions.orderByIndexedField).eql({field: 'count'});
        LibMySql.query = saveExecute;
    });

    it('query processMessage should fail if orderByIndexedField direction is invalid', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.query,
            id: '1',
            request: {
                tableName: 'hello.x',
                queryString: '$.count > 1',
                options: {
                    orderByIndexedField: {field: 'count', direction: 'sideways'}
                }
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.query);
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('query processMessage should fail if required parameters are missing', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.query,
            id: '1',
            request: {
                tableName: 'hello.x'
            }
        });
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });
});
