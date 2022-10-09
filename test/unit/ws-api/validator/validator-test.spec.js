/*global describe, it*/
import mockedFunctions from '../../setup-mocks.js';
import * as chai from 'chai';
import {addSchema, validateRequest, validateResponse} from "../../../../src/ws-api/validator/validator.js";
import {getSchema} from "../../../../src/api/get.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let expect = chai.expect;
describe('unit test for addSchema', function () {
    it('should fail for not defined function', async function () {
        let isExceptionOccurred = false;
        try {
            addSchema('test', getSchema());
        } catch (e) {
            isExceptionOccurred = true;
            expect(e.toString()).eql('Error: Please provide valid function');
        }

        expect(isExceptionOccurred).eql(true);
    });
    it('should fail for invalid Schema', async function () {
        let isExceptionOccurred = false;
        try {
            addSchema(COCO_DB_FUNCTIONS.get, {});
        } catch (e) {
            isExceptionOccurred = true;
            expect(e.toString()).eql('Error: Please provide valid schema Object');
        }

        expect(isExceptionOccurred).eql(true);
    });
    it('should fail for rest schema', async function () {
        let isExceptionOccurred = false;
        try {
            addSchema(COCO_DB_FUNCTIONS.get, {
                querystring: {},
                body: {}
            });
        } catch (e) {
            isExceptionOccurred = true;
            expect(e.toString()).eql('Error: request Schema is invalid');
        }

        expect(isExceptionOccurred).eql(true);
    });

    it('should fail if 200 response schema not defined', async function () {
        let isExceptionOccurred = false;
        try {
            addSchema(COCO_DB_FUNCTIONS.get, {
                querystring: {}
            });
        } catch (e) {
            isExceptionOccurred = true;
            expect(e.toString()).eql('Error: Please provide valid responseSchema');
        }

        expect(isExceptionOccurred).eql(true);
    });

    it('should fail if 200 response schema not defined', async function () {
        let isExceptionOccurred = false;
        try {
            addSchema(COCO_DB_FUNCTIONS.get, {
                querystring: {},
                response: {
                    400: {}
                }
            });
        } catch (e) {
            isExceptionOccurred = true;
            expect(e.toString()).eql('Error: Please provide valid schema to success');
        }

        expect(isExceptionOccurred).eql(true);
    });

    it('should fail if 400 response schema not defined', async function () {
        let isExceptionOccurred = false;
        try {
            addSchema(COCO_DB_FUNCTIONS.get, {
                querystring: {},
                response: {
                    200: {}
                }
            });
        } catch (e) {
            isExceptionOccurred = true;
            expect(e.toString()).eql('Error: Please provide valid schema to report error');
        }

        expect(isExceptionOccurred).eql(true);
    });
    it('validate request should fail function is  defined', async function () {
        const isValid = validateRequest('abc', {});
        expect(isValid).eql(false);
    });
    it('validate request should fail if request is empty', async function () {
        const isValid = validateRequest(COCO_DB_FUNCTIONS.get, {});
        expect(isValid).eql(false);
    });
    it('validate request should fail if function not supported', async function () {
        COCO_DB_FUNCTIONS.test = 'test';
        const isValid = validateRequest(COCO_DB_FUNCTIONS.test, {
            hello: 'world'
        });
        expect(isValid).eql(false);
        delete COCO_DB_FUNCTIONS.test;
    });
    it('validate response should fail function is  defined', async function () {
        const isValid = validateResponse('abc', {});
        expect(isValid).eql(false);
    });
    it('validate response should fail if request is empty', async function () {
        const isValid = validateResponse(COCO_DB_FUNCTIONS.get, {});
        expect(isValid).eql(false);
    });
    it('validate response should fail if function not supported', async function () {
        COCO_DB_FUNCTIONS.test = 'test';
        const isValid = validateResponse(COCO_DB_FUNCTIONS.test, {
            hello: 'world'
        });
        expect(isValid).eql(false);
        delete COCO_DB_FUNCTIONS.test;
    });
});
