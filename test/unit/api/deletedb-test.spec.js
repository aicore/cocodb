/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {deleteDb, getDeleteDBSchema} from "../../../src/api/deleteDb.js";

let expect = chai.expect;
describe('unit test for delete database tests', function () {
    it('delete database should pass', async function () {
        const response = await deleteDb({
            body: {
                dataBaseName: 'hello'
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
        const saveExecute = LibMySql.createTable;
        LibMySql.deleteDataBase = async function (tableName) {
            throw new Error('error');
        };
        const response = await deleteDb({
            body: {
                dataBaseName: 'hello'
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
        LibMySql.createDataBase = saveExecute;

    });
    it('deleteDb schema', function () {
        const schema = getDeleteDBSchema();
        expect(schema.schema.body.required[0]).eql('databaseName');
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');

    });
});

