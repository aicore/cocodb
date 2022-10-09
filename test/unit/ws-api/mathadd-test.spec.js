/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {mathAdd} from "../../../src/ws-api/mathadd.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let expect = chai.expect;
describe('unit test for mathAdd tests', function () {
    it('mathAdd should pass', async function () {
        const response = await mathAdd(
            {
                tableName: 'hello.x',
                documentId: '123',
                jsonFieldsIncrements: {
                    x: 1
                }

            }
        );
        expect(response.isSuccess).to.eql(true);
    });
    it('mathAdd should fail', async function () {
        const saveExecute = LibMySql.mathAdd;
        LibMySql.mathAdd = async function (_tableName, _documentId, _jsonFieldsIncrements) {
            throw new Error('error');
        };
        const response = await mathAdd(
            {
                tableName: 'hello.x',
                documentId: '123',
                jsonFieldsIncrements: {
                    x: 1
                }
            }
        );
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.mathAdd = saveExecute;
    });
    it('processMessage should pass for mathAdd', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.mathAdd,
            id: '1',
            request: {
                tableName: 'hello.x',
                documentId: '123',
                jsonFieldsIncrements: {
                    x: 1
                }
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.mathAdd);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
    });
    it('mathAdd processMessage should fail if required parameters are missing name', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.mathAdd,
            id: '1',
            request: {
                tableame: 'hello.x',
                documentId: '123',
                jsonFieldsIncrements: {
                    x: 1
                }
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.mathAdd);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('processMessage should fail if response validation fails for mathAdd api', async function () {
        const saveExecute = LibMySql.mathAdd;
        LibMySql.mathAdd = async function (_tableName, _documentId, _jsonFieldsIncrements) {
            return new Promise(resolve => {

                resolve({});
            });
        };
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.mathAdd,
            id: '1',
            request: {
                tableName: 'hello.x',
                documentId: '123',
                jsonFieldsIncrements: {
                    x: 1
                }
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.mathAdd);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('server did not send valid data');
        LibMySql.mathAdd = saveExecute;
    });
});

