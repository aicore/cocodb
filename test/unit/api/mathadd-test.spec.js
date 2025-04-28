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

    it('should pass with condition', async function () {
        const response = await mathAdd({
            body: {
                tableName: 'hello',
                documentId: '1235',
                jsonFieldsIncrements: {
                    id: 1,
                    age: 2
                },
                condition: 'id > 0'
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

    it('should fail when condition is not satisfied', async function () {
        const saveExecute = LibMySql.mathAdd;
        LibMySql.mathAdd = async function (_tableName, _docId, _fieldsToIncrementMap, _condition) {
            // Simulating a situation where the condition is not satisfied
            throw new Error('Not updated - condition failed or unable to find documentId');
        };

        const response = await mathAdd({
            body: {
                tableName: 'hello',
                documentId: '1235',
                jsonFieldsIncrements: {
                    id: 1,
                    age: 2
                },
                condition: 'id < 0'
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
        expect(response.errorMessage).eql('Error: Not updated - condition failed or unable to find documentId');
        LibMySql.mathAdd = saveExecute;
    });

    it('get should throw error message in case of failure', async function () {
        const saveExecute = LibMySql.mathAdd;
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

    it('should throw error message when condition causes error', async function () {
        const saveExecute = LibMySql.mathAdd;
        LibMySql.mathAdd = async function (_tableName, _docId, _fieldsToIncrementMap, _condition) {
            throw new Error('invalid condition syntax');
        };
        const response = await mathAdd({
            body: {
                tableName: 'hello',
                documentId: '1235',
                jsonFieldsIncrements: {
                    id: 1,
                    age: 2
                },
                condition: 'invalid syntax !!'
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
        expect(response.errorMessage).eql('Error: invalid condition syntax');
        LibMySql.mathAdd = saveExecute;
    });

    it('validate schema', function () {
        const schema = getMathAddSchema();
        expect(schema.schema.body.required[0]).eql('tableName');
        expect(schema.schema.body.required[1]).eql('documentId');
        expect(schema.schema.body.required[2]).eql('jsonFieldsIncrements');
        expect(schema.schema.body.properties.condition).to.exist;
        expect(schema.schema.body.properties.condition.type).eql('string');
        expect(schema.schema.body.properties.condition.minLength).eql(1);
        expect(schema.schema.body.properties.condition.maxLength).eql(2048);
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');

    });
});
