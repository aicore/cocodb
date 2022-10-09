import {COCO_DB_FUNCTIONS, isObjectEmpty, isObject} from "@aicore/libcommonutils";
import Ajv from "ajv";

export const AJV = new Ajv();


/* A map that maps a function name to a validator object. */
const FN_TO_VALIDATOR = {};

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
        throw new Error('Please provide valid schema to success');
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
 * It checks if the function name is valid, and if it is, it checks if the request is valid
 * @param {string} fn - The function name.
 * @param{Object} request - The request object that was sent to the server.
 * @returns {boolean} A function that takes two arguments, fn and request, and returns a boolean.
 */
export function validateRequest(fn, request) {
    if (!(fn in COCO_DB_FUNCTIONS)) {
        return false;
    }
    if (fn === COCO_DB_FUNCTIONS.hello) {
        return true;
    }
    if (!isObject(request) || isObjectEmpty(request)) {
        return false;
    }
    if (!isObject(FN_TO_VALIDATOR[fn])) {
        return false;
    }
    return FN_TO_VALIDATOR[fn].requestValidator(request);
}

/**
 * It checks that the response is an object, that it has a property called `isSuccess`, and that the value of
 * `isSuccess` is a boolean. If `isSuccess` is true, it checks that the response has a property called `data`
 * and that the value of `data` is an object. If `isSuccess` is false, it checks that the response has a property
 * called `error` and that the
 * value of `error` is a string
 * @param{string} fn - The function name that was called.
 * @param{Object} response - The response object returned by the server.
 * @returns {boolean}
 */
export function validateResponse(fn, response) {
    if (!(fn in COCO_DB_FUNCTIONS)) {
        return false;
    }
    if (fn === COCO_DB_FUNCTIONS.hello) {
        return true;
    }
    if (!isObject(response) || isObjectEmpty(response)) {
        return false;
    }

    if (!FN_TO_VALIDATOR[fn]) {
        return false;
    }
    const validator = response.isSuccess ? FN_TO_VALIDATOR[fn].successValidator : FN_TO_VALIDATOR[fn].failureValidator;
    if (!validator) {
        return false;
    }
    return validator(response);
}
