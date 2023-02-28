/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {getUpdateSchema, update} from "../../../src/api/update.js";

let expect = chai.expect;
describe('unit test for update test', function () {
    it('should pass', async function () {
        const response = await update({
            body: {
                tableName: 'hello',
                document: {hello: "world"},
                documentId: '1234'
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
        expect(response.documentId).eql('1234');
        expect(response.isSuccess).eql(true);

    });
    it('should pass with conditional update', async function () {
        const response = await update({
            body: {
                tableName: 'hello',
                document: {hello: "world"},
                documentId: '1234',
                condition: "$.A<10"
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
        expect(response.documentId).eql('1234');
        expect(response.isSuccess).eql(true);

    });
    it('update document should throw error message in case of failure', async function () {
        const saveExecute = LibMySql.update;
        LibMySql.update = async function (_tableName, _documentId, _document) {
            throw new Error('error');
        };

        const response = await update({
            body: {
                tableName: 'hello',
                document: {hello: "world"},
                documentId: '1234'
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
        LibMySql.update = saveExecute;
    });

    it('update schema test', function () {
        const schema = getUpdateSchema();
        expect(schema.schema.body.required[0]).eql('tableName');
        expect(schema.schema.body.required[1]).eql('documentId');
        expect(schema.schema.body.required[2]).eql('document');
        expect(schema.schema.response[200].required[0]).eql('documentId');
        expect(schema.schema.response[200].required[1]).eql('isSuccess');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');

    });
});
