/*global describe, it*/
import mockedFunctions from '../setup-mocks.js';
import LibMySql from "@aicore/libmysql";
import * as chai from 'chai';
import {getFromNonIndex} from "../../../src/ws-api/getFromNonIndex.js";
import {processesMessage} from "../../../src/ws-api/wsProcessor.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let expect = chai.expect;
describe('unit test for create database tests', function () {
    it('getFromNonIndex should pass', async function () {
        const response = await getFromNonIndex(
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
    it('getFromNonIndex should fail', async function () {
        const saveExecute = LibMySql.getFromNonIndex;
        LibMySql.getFromNonIndex = async function (_tableName, _queryString) {
            throw new Error('error');
        };
        const response = await getFromNonIndex(
            {
                tableName: 'hello.x',
                queryObject: {
                    hello: 'world'
                }
            }
        );
        expect(response.isSuccess).eql(false);
        expect(response.errorMessage).eql('Error: error');
        LibMySql.getFromNonIndex = saveExecute;
    });
    it('processMessage should pass for getFromNonIndex', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.getFromNonIndex,
            id: '1',
            request: {
                tableName: 'hello.x',
                queryObject: {
                    hello: 'world'
                }
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.getFromNonIndex);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(true);
        expect(resp.response.documents[0][1]).eql('2');
    });

    it('processMessage should fail for getFromNonIndex if invalid options passed', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.getFromNonIndex,
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
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.getFromNonIndex);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('getFromNonIndex processMessage should fail if required parameters are missing name', async function () {
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.getFromNonIndex,
            id: '1',
            request: {
                tablename: 'hello.x'
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.getFromNonIndex);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('request validation Failed');
    });

    it('processMessage should fail if response validation fails for getFromNonIndex api', async function () {
        const saveExecute = LibMySql.getFromNonIndex;
        LibMySql.getFromNonIndex = async function (_tableName, _queryObject) {
            return new Promise(resolve => {

                resolve(true);
            });
        };
        const resp = await processesMessage({
            fn: COCO_DB_FUNCTIONS.getFromNonIndex,
            id: '1',
            request: {
                tableName: 'hello.x',
                queryObject: {
                    hello: 'world'
                }
            }
        });
        expect(resp.fn).eql(COCO_DB_FUNCTIONS.getFromNonIndex);
        expect(resp.id).eql('1');
        expect(resp.response.isSuccess).eql(false);
        expect(resp.response.errorMessage).eql('server did not send valid data');
        LibMySql.getFromNonIndex = saveExecute;
    });
});

