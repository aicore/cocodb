/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {getFromNonIndex, getFromNonIndexSchema} from "../../../src/api/getFromNonIndex.js";

let expect = chai.expect;
describe('unit test for getFromNonIndex', function () {
    it('should  pass', async function () {
        const response = await getFromNonIndex({
            body: {
                tableName: 'hello',
                queryObject: {hello: "world"}
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
        expect(response.results.length).eql(1);
        expect(response.isSuccess).eql(true);
    });

    it('getFromNonIndex should throw error message in case of failure', async function () {
        const saveExecute = LibMySql.getFromNonIndex;
        LibMySql.getFromNonIndex = async function (_tableName, _queryObject) {
            throw new Error('error');
        };

        const response = await getFromNonIndex({
            body: {
                tableName: 'hello',
                queryObject: {hello: "world"}
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
        LibMySql.getFromNonIndex = saveExecute;
    });

    it('validate schema', function () {
        const schema = getFromNonIndexSchema();
        expect(schema.schema.body.required[0]).eql('tableName');
        expect(schema.schema.body.required[1]).eql('queryObject');
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[200].required[1]).eql('documents');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');

    });

});
