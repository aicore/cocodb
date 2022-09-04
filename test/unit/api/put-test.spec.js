/*global describe, it*/
import mockedFunctions from '../../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {putDocument, getPutSchema} from "../../../src/api/put.js";
import {hello} from "../../../src/api/hello.js";

let expect = chai.expect;
describe('unit test for put api', function () {
    it('putDocument Should pass', async function () {
        const response = await putDocument({
            body: {
                tableName: 'hello',
                document: {hello: "world"}
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
        expect(response.documentId).eql('12345');

    });
    it('put document should throw error message in case of failure', async function () {
        const saveExecute = LibMySql.put;
        LibMySql.put = async function (_tableName, _document) {
            throw new Error('error');
        };

        const response = await putDocument({
            body: {
                tableName: 'hello',
                document: {hello: "world"}
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
        expect(response.errorMessage).eql('Error: error');
        LibMySql.put = saveExecute;
    });

    it('put schema test', function () {
        const schema = getPutSchema();
        expect(schema.schema.body.required[0]).eql('tableName');
        expect(schema.schema.body.required[1]).eql('document');
        expect(schema.schema.response[200].required[0]).eql('documentId');
        expect(schema.schema.response[400].required[0]).eql('errorMessage');

    });
    it('hello test', function () {
        const response = hello({}, {});
        expect(response.hello).eql('world');
    });

});
