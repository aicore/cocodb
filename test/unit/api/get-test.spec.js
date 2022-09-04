/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {get, getSchema} from "../../../src/api/get.js";
import {getFromNonIndexSchema} from "../../../src/api/getFromNonIndex.js";
let expect = chai.expect;
describe('unit test for get', function (){

    it('should pass', async function () {
        const response = await get({
            query: {
                tableName: 'hello',
                documentId: '1235'
            },
            log: {
                error: function (msg) {

                },
                info: function (msg) {

                }
            }
        }, {
            code: function (code) {

            }
        });
        expect(response.document.hello).eql('world');
        expect(response.isSuccess).eql(true);

    });

    it('get should throw error message in case of failure', async function () {
        const saveExecute = LibMySql.get;
        LibMySql.get = async function (_tableName, _docId) {
            throw new Error('error');
        };

        const response = await get({
            query: {
                tableName: 'hello',
                documentId: '1235'
            },
            log: {
                error: function (msg) {

                },
                info: function (msg) {

                }
            }
        }, {
            code: function (code) {

            }
        });
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.get = saveExecute;
    });

    it('validate schema', function () {
        const schema = getSchema();
        expect(schema.schema.querystring.required[0]).eql('tableName');
        expect(schema.schema.querystring.required[1]).eql('documentId');
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[200].required[1]).eql('document');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');

    });
});
