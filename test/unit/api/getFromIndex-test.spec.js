/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {getFromIndex, getFromIndexSchema} from "../../../src/api/getFromIndex.js";

let expect = chai.expect;

describe('Ut for getFromIndex', function () {

    it('should pass', async function () {
        const response = await getFromIndex({
            body: {
                tableName: 'customers',
                queryObject: {id: "1"}
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
        expect(response.documents.length).eql(1);
        expect(response.isSuccess).eql(true);
    });
    it('getFromIndex should throw error message in case of failure', async function () {
        const saveExecute = LibMySql.getFromIndex;
        LibMySql.getFromIndex = async function (_tableName, _queryObject) {
            throw new Error('error');
        };

        const response = await getFromIndex({
            body: {
                tableName: 'customers',
                queryObject: {id: "1"}
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
        LibMySql.getFromIndex = saveExecute;
    });

    it('validate schema', function () {
        const schema = getFromIndexSchema();
        expect(schema.schema.body.required[0]).eql('tableName');
        expect(schema.schema.body.required[1]).eql('queryObject');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[200].required[1]).eql('documents');

    });


    it('getFromIndex should forward options.orderByIndexedField to LibMySql', async function () {
        const saveExecute = LibMySql.getFromIndex;
        let receivedOptions;
        LibMySql.getFromIndex = async function (_tableName, _queryObject, options) {
            receivedOptions = options;
            return [];
        };
        const orderBy = {field: 'count', direction: 'DESC'};
        const response = await getFromIndex({
            body: {
                tableName: 'customers',
                queryObject: {id: "1"},
                options: {orderByIndexedField: orderBy, pageOffset: 0, pageLimit: 10}
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
        expect(receivedOptions.orderByIndexedField).eql(orderBy);
        expect(receivedOptions.pageOffset).eql(0);
        expect(receivedOptions.pageLimit).eql(10);
        LibMySql.getFromIndex = saveExecute;
    });

    it('getFromIndex schema should define options.orderByIndexedField', function () {
        const schema = getFromIndexSchema();
        const orderBy = schema.schema.body.properties.options.properties.orderByIndexedField;
        expect(orderBy.type).eql('object');
        expect(orderBy.required).eql(['field']);
        expect(orderBy.properties.field.type).eql('string');
        expect(orderBy.properties.direction.enum).eql(['ASC', 'DESC']);
        expect(orderBy.properties.direction.default).eql('ASC');
    });

});
