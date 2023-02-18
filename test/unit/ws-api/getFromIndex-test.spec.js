/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {getFromIndex} from "../../../src/ws-api/getFromIndex.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let expect = chai.expect;
describe('unit test for create database tests', function () {
    it('getFromIndex should pass', async function () {
        const response = await getFromIndex(
            {
                tableName: 'hello.x',
                queryObject: {
                    hello: 'world'
                }
            }
        );
        expect(response.isSuccess).to.eql(true);
        expect(response.documents[0][1]).eql('2');
    });
    it('getFromIndex should fail', async function () {
        const saveExecute = LibMySql.getFromIndex;
        LibMySql.getFromIndex = async function (_tableName, _queryString) {
            throw new Error('error');
        };
        const response = await getFromIndex(
            {
                tableName: 'hello.x',
                queryObject: {
                    hello: 'world'
                }
            }
        );
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.getFromIndex = saveExecute;
    });
    it('processMessage should pass for getFromIndex', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.getFromIndex,
            id: '1',
            request: {
                tableName: 'hello.x',
                queryObject: {
                    hello: 'world'
                }
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.getFromIndex);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
        expect(resp.response.documents[0][1]).eql('2');
    });
    it('getFromIndex processMessage should fail if required parameters are missing name', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.getFromIndex,
            id: '1',
            request: {
                tablename: 'hello.x'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.getFromIndex);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('getFromIndex processMessage should fail if invalid parameters for options', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.getFromIndex,
            id: '1',
            request: {
                tableName: 'hello.x',
                queryObject: {
                    hello: 'world'
                },
                options: {
                    pageOffset: "string should fail"
                }
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.getFromIndex);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('processMessage should fail if response validation fails for getFromIndex api', async function () {
        const saveExecute = LibMySql.getFromIndex;
        LibMySql.getFromIndex = async function (_tableName, _queryObject) {
            return new Promise(resolve => {

                resolve(true);
            });
        };
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.getFromIndex,
            id: '1',
            request: {
                tableName: 'hello.x',
                queryObject: {
                    hello: 'world'
                }
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.getFromIndex);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('server did not send valid data');
        LibMySql.getFromIndex = saveExecute;
    });
});

