/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {createDb, getCreateDbSchema} from "../../../src/api/createdb.js";

let expect = chai.expect;
describe('unit test for create database tests', function () {
    it('create database should pass', async function () {
        const response = await createDb({
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
        LibMySql.createDataBase = async function (tableName) {
            throw new Error('error');
        };
        const response = await createDb({
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
    it('createDb schema', function () {
        const schema = getCreateDbSchema();
        expect(schema.schema.body.required[0]).eql('databaseName');
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');

    });
});

