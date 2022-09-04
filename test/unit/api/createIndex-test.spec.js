/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import chai from "chai";
import {createIndex, getCreateIndexSchema} from "../../../src/api/createIndex.js";

let expect = chai.expect;

describe('createIndexApi', function () {

    it('should pass', async function () {
        const response = await createIndex({
            body: {
                tableName: 'hello',
                jsonField: 'id',
                dataType: 'varchar(50)',
                isUnique: true,
                isNotNull: true
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
    it('should pass if  isUnique not present', async function () {
        const response = await createIndex({
            body: {
                tableName: 'hello',
                jsonField: 'id',
                dataType: 'varchar(50)',
                isUnique: true
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
    it('should pass if  isNonNull not present', async function () {
        const response = await createIndex({
            body: {
                tableName: 'hello',
                jsonField: 'id',
                dataType: 'varchar(50)',
                isNotNull: true
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
        const saveExecute = LibMySql.createIndexForJsonField;
        LibMySql.createIndexForJsonField = async function (_tableName, _jsonField, _dataType,
            _isUnique, _isNotNull) {
            throw new Error('error');
        };
        const response = await createIndex({
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
        LibMySql.createIndexForJsonField = saveExecute;
    });
    it('validate createIndex schema', function () {
        const schema = getCreateIndexSchema();
        expect(schema.schema.body.required[0]).eql('tableName');
        expect(schema.schema.body.required[1]).eql('jsonField');
        expect(schema.schema.body.required[2]).eql('dataType');
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');

    });
});
