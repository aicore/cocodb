import {COCO_DB_FUNCTIONS, isObjectEmpty, isObject} from "@aicore/libcommonutils";
import Ajv from "ajv";

export const AJV = new Ajv();


const FN_TO_VALIDATOR = {};
export const VALIDATE = {
    REQUEST: 0,
    RESPONSE_SUCCESS: 1,
    RESPONSE_FAIL: 3
};

/**
 * It takes in a function name and a schema object and adds the schema to the apiToValidator object
 * @param{string} fn - The name of the function to be validated.
 * @param{Object} schema - The schema object that you want to validate against.
 */
export function addSchema(fn, schema) {
    if (!fn in COCO_DB_FUNCTIONS) {
        throw new Error('Please provide valid function');
    }
    if (isObjectEmpty(schema)) {
        throw  new Error('Please provide valid schema Object');
    }
    const validator = {};
    if (schema.querystring && !schema.body) {
        const requestSchema = schema.querystring;
        const requestValidator = AJV.compile(requestSchema);
        validator.requestValidator = requestValidator;


    } else if (!schema.querystring && schema.body) {
        const requestSchema = schema.body;
        const requestValidator = AJV.compile(requestSchema);
        validator.requestValidator = requestValidator;

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
    const successValidator = AJV.compile(successSchema);
    validator.successValidator = successValidator;
    if (!schema.response["400"]) {
        throw new Error('Please provide valid schema to report error');
    }
    const failureSchema = schema.response["400"];
    const failureValidator = AJV.compile(failureSchema);
    validator.failureValidator = failureValidator;
    FN_TO_VALIDATOR[fn] = validator;
}

export function validate(fn, request, validate) {
    if (!fn in COCO_DB_FUNCTIONS) {
        return false;
    }
    if (!isObject(request) || isObjectEmpty(request)) {
        return false;
    }
    if (!validate in VALIDATE) {
        return false;
    }
    if (!isObject(FN_TO_VALIDATOR[fn])) {
        return false;
    }
    switch (validate) {
    case VALIDATE.REQUEST:
        return FN_TO_VALIDATOR[fn].requestValidator(request);
    case VALIDATE.RESPONSE_SUCCESS:
        return FN_TO_VALIDATOR[fn].successValidator(request);
    case VALIDATE.RESPONSE_FAIL:
        return FN_TO_VALIDATOR[fn].failureValidator(request);
    }
    return false;

}
