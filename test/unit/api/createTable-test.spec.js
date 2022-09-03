/*global describe, it*/
import mockedFunctions from '../utils/setup-mocks.js';
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
        expect(schema.schema.body.type).eql('object');
        expect(schema.schema.response[200].type).eql('object');
        expect(schema.schema.response[400].type).eql('object');
    });
});

