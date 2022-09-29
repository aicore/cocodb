/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {getMathAddSchema, mathAdd} from "../../../src/api/mathadd.js";

let expect = chai.expect;
describe('unit test for mathAdd', function () {

    it('should pass', async function () {
        const response = await mathAdd({
            body: {
                tableName: 'hello',
                documentId: '1235',
                jsonFieldsIncrements: {
                    id: 1,
                    age: 2
                }
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
        expect(response.isSuccess).eql(true);

    });

    it('get should throw error message in case of failure', async function () {
        const saveExecute = LibMySql.get;
        LibMySql.mathAdd = async function (_tableName, _docId, _fieldsToIncrementMap) {
            throw new Error('error');
        };

        const response = await mathAdd({
            body: {
                tableName: 'hello',
                documentId: '1235',
                jsonFieldsIncrements: {
                    id: 1,
                    age: 2
                }
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
        LibMySql.mathAdd = saveExecute;
    });

    it('validate schema', function () {
        const schema = getMathAddSchema();
        expect(schema.schema.body.required[0]).eql('tableName');
        expect(schema.schema.body.required[1]).eql('documentId');
        expect(schema.schema.body.required[2]).eql('jsonFieldsIncrements');
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');

    });
});
