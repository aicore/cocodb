/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {deleteTable, getDeleteTableSchema} from "../../../src/api/deleteTable.js";

let expect = chai.expect;
describe('Unit test for delete table', function () {
    it('deleteTable should pass', async function () {
        const response = await deleteTable({
            body: {
                tableName: 'hello'
            },
            log: {
                error: function (msg) {

                },
                info: function (msg) {

                }
            }
        }, {});
        expect(response.isSuccess).to.eql(true);

    });
    it('should fail', async function () {
        const saveExecute = LibMySql.deleteTable;
        LibMySql.deleteTable = async function (tableName, documentId) {
            throw new Error('error');
        };
        const response = await deleteTable({
            body: {
                tableName: 'hello'
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
        LibMySql.deleteTable = saveExecute;

    });
    it('validate DeleteTableSchema', function () {
        const schema = getDeleteTableSchema();
        expect(schema.schema.body.required[0]).eql('tableName');
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');
    });

});
