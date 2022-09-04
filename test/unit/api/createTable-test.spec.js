/*global describe, it*/
import mockedFunctions from '../../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {createTable, getCreatTableSchema} from "../../../src/api/createTable.js";

let expect = chai.expect;
describe('unit test for createTable tests', function () {
    it('create table should pass', async function () {
        const response = await createTable({
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
        const saveExecute = LibMySql.createTable;
        LibMySql.createTable = async function (tableName) {
            throw new Error('error');
        };
        const response = await createTable({
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
        LibMySql.createTable = saveExecute;

    });
    it('validate table schema', function () {
        const schema = getCreatTableSchema();
        expect(schema.schema.body.required[0]).eql('tableName');
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');

    });
});

