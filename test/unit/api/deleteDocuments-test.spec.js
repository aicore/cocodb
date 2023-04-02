/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {deleteDocuments, getDeleteDocumentsSchema} from "../../../src/api/deleteDocuments.js";

let expect = chai.expect;

describe('unit test for delete documents', function () {

    it('deleteDocuments should pass without index field', async function () {
        const saveExecute = LibMySql.deleteDocuments;
        let table, query, index;
        LibMySql.deleteDocuments = async function (_table, _query, _index) {
            table = _table; query = _query; index = _index;
            return 123;
        };
        const response = await deleteDocuments({
            body: {
                tableName: 'hello',
                queryString: '123'
            },
            log: {
                error: function (msg) {

                },
                info: function (msg) {

                }
            }
        }, {});
        expect(response.isSuccess).to.eql(true);
        expect(response.deleteCount).to.eql(123);
        expect(table).to.eql('hello');
        expect(query).to.eql('123');
        expect(index).to.not.exist;
        LibMySql.deleteDocuments = saveExecute;
    });

    it('deleteDocuments should pass with index field', async function () {
        const saveExecute = LibMySql.deleteDocuments;
        let table, query, index;
        LibMySql.deleteDocuments = async function (_table, _query, _index) {
            table = _table; query = _query; index = _index;
            return 123;
        };
        const response = await deleteDocuments({
            body: {
                tableName: 'hello',
                queryString: '123',
                useIndexForFields: ["a.y", "b"]
            },
            log: {
                error: function (msg) {

                },
                info: function (msg) {

                }
            }
        }, {});
        expect(response.isSuccess).to.eql(true);
        expect(response.deleteCount).to.eql(123);
        expect(table).to.eql('hello');
        expect(query).to.eql('123');
        expect(index).to.eql([ 'a.y', 'b' ]);
        LibMySql.deleteDocuments = saveExecute;
    });

    it('should fail', async function () {
        const saveExecute = LibMySql.deleteDocuments;
        LibMySql.deleteDocuments = async function () {
            throw new Error('error');
        };
        const response = await deleteDocuments({
            body: {
                tableName: 'hello',
                queryString: '123'
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
        LibMySql.deleteDocuments = saveExecute;

    });
    it('validate deleteDocuments schema', function () {
        const schema = getDeleteDocumentsSchema();
        expect(schema.schema.body.required[0]).eql('tableName');
        expect(schema.schema.body.required[1]).eql('queryString');
        expect(schema.schema.response[200].required[0]).eql('isSuccess');
        expect(schema.schema.response[200].required[1]).eql('deleteCount');
        expect(schema.schema.response[400].required[0]).eql('isSuccess');
        expect(schema.schema.response[400].required[1]).eql('errorMessage');
    });
});
