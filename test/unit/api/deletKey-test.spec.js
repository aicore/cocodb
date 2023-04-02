/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {deleteKey, getDeleteKeySchema} from "../../../src/api/deleteKey.js";

let expect = chai.expect;

describe('unit test for delete key', function () {

    it('deletekey should pass', async function () {
        const response = await deleteKey({
            body: {
                tableName: 'hello',
                documentId: '123'
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
    it('deleteKey should pass with condition', async function () {
        const response = await deleteKey({
            body: {
                tableName: 'hello',
                documentId: '123',
                condition: "$.x = 30"
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
        const saveExecute = LibMySql.deleteKey;
        LibMySql.deleteKey = async function (tableName, documentId) {
            throw new Error('error');
        };
        const response = await deleteKey({
            body: {
                tableName: 'hello',
                documentId: '123'
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
        LibMySql.deleteKey = saveExecute;

    });
    it('validate DeleteKeySchema', function () {
        const schema = getDeleteKeySchema();
        expect(schema.schema.body.required[0]).eql('tableName');
        expect(schema.schema.body.required[1]).eql('documentId');
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');
    });
});
