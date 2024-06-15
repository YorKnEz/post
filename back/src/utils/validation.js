import { ErrorCodes, ErrorMessage } from './index.js'

// simple schema validation for string fields
export const validate = (obj, schema) => {
    for (const key in schema) {
        // check that all keys are present
        if (!(key in obj)) {
            throw new ErrorMessage(
                ErrorCodes.VALIDATION,
                `Missing field ${key}`
            )
        }

        // check the requirements for each field
        if ('min' in schema[key] && obj[key].length < schema[key].min) {
            throw new ErrorMessage(
                ErrorCodes.VALIDATION,
                `Length of field ${key} should be at least ${schema[key].min}`
            )
        }
        if ('max' in schema[key] && obj[key].length > schema[key].max) {
            throw new ErrorMessage(
                ErrorCodes.VALIDATION,
                `Length of field ${key} should be at most ${schema[key].max}`
            )
        }
        if ('regex' in schema[key]) {
            if (schema[key].regex instanceof RegExp) {
                // regex provided as plain RegExp
                if (!schema[key].regex.test(obj[key])) {
                    throw new ErrorMessage(
                        ErrorCodes.VALIDATION,
                        `Field ${key} does not match ${schema[key].regex}`
                    )
                }
            } else {
                // regex provided as (pattern, message) pair
                if (!schema[key].regex.pattern.test(obj[key])) {
                    throw new ErrorMessage(
                        ErrorCodes.VALIDATION,
                        schema[key].regex.message
                    )
                }
            }
        }
    }
}

export const registerSchema = {
    firstName: {
        min: 2,
        max: 32,
        regex: /^[a-zA-Z0-9]*$/,
    },
    lastName: {
        min: 2,
        max: 32,
        regex: /^[a-zA-Z0-9]*$/,
    },
    nickname: {
        min: 4,
        max: 32,
        regex: /^[a-zA-Z0-9]*$/,
    },
    email: {
        min: 4,
        max: 256,
        regex: {
            pattern:
                /^((([!#$%&'*+\-/=?^_`{|}~\w])|([!#$%&'*+\-/=?^_`{|}~\w][!#$%&'*+\-/=?^_`{|}~\.\w]{0,}[!#$%&'*+\-/=?^_`{|}~\w]))[@]\w+([-.]\w+)*\.\w+([-.]\w+)*)$/,
            message: 'This is not a valid email',
        },
    },
    password: {
        min: 8,
        max: 64,
    },
}

export const loginSchema = {
    identifier: {},
    password: {
        min: 8,
        max: 64,
    },
}
