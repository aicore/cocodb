import {COCO_DB_FUNCTIONS, isObjectEmpty, isObject} from "@aicore/libcommonutils";
import Ajv from "ajv";

export const AJV = new Ajv();


/* A map that maps a function name to a validator object. */
const FN_TO_VALIDATOR = {};

/* An enum that is used to validate the request and response. */
export const VALIDATOR = {
    REQUEST: 0,
    RESPONSE_SUCCESS: 1,
    RESPONSE_FAIL: 2,
    isPresent: function (value) {
        return value >= 0 && value <= 2;

    }
};

/**
 * It takes in a function name and a schema object and adds the schema to the apiToValidator object
 * @param{string} fn - The name of the function to be validated.
 * @param{Object} schema - The schema object that you want to validate against.
 */
export function addSchema(fn, schema) {
    if (!(fn in COCO_DB_FUNCTIONS)) {
        throw new Error('Please provide valid function');
    }
    if (isObjectEmpty(schema)) {
        throw  new Error('Please provide valid schema Object');
    }
    const validator = {};
    if (schema.querystring && !schema.body) {
        const requestSchema = schema.querystring;
        validator.requestValidator = AJV.compile(requestSchema);


    } else if (!schema.querystring && schema.body) {
        const requestSchema = schema.body;
        validator.requestValidator = AJV.compile(requestSchema);

    } else {
        throw new Error('request Schema is invalid');
    }

    if (!schema.response) {
        throw new Error('Please provide valid responseSchema');
    }
    if (!schema.response["200"]) {
        throw new Error('Please provide valid schema to report error');
    }

    const successSchema = schema.response["200"];
    validator.successValidator = AJV.compile(successSchema);
    if (!schema.response["400"]) {
        throw new Error('Please provide valid schema to report error');
    }
    const failureSchema = schema.response["400"];
    validator.failureValidator = AJV.compile(failureSchema);
    FN_TO_VALIDATOR[fn] = validator;
}

/**
 * It takes a function name, a request object, and a validation type, and returns true if the request object
 * is valid for the given function and validation type
 * @param {string} fn - The function name.
 * @param {object} request - the request object
 * @param {number} validator - This is a function that takes three parameters:
 * @returns {boolean} A boolean value.
 */
export function validate(fn, request, validator) {
    if (!(fn in COCO_DB_FUNCTIONS)) {
        return false;
    }
    if (!isObject(request) || isObjectEmpty(request)) {
        return false;
    }
    if (!VALIDATOR.isPresent(validator)) {
        return false;
    }
    if (!isObject(FN_TO_VALIDATOR[fn])) {
        return false;
    }
    switch (validator) {
    case VALIDATOR.REQUEST:
        return FN_TO_VALIDATOR[fn].requestValidator(request);
    case VALIDATOR.RESPONSE_SUCCESS:
        return FN_TO_VALIDATOR[fn].successValidator(request);
    case VALIDATOR.RESPONSE_FAIL:
        return FN_TO_VALIDATOR[fn].failureValidator(request);
    }
    return false;
}
