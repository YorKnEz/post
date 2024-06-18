import { ErrorCodes, ErrorMessage } from './index.js'

// simple schema validation for string fields
export const validate = (obj, schema) => {
    for (const key in schema) {
        // check that all keys are present
        if (!(key in obj)) {
            throw new ErrorMessage(
                ErrorCodes.VALIDATION_MISSING_FIELD,
                `Missing field ${key}`
            )
        }

        // check the requirements for each field
        if ('min' in schema[key] && obj[key].length < schema[key].min) {
            throw new ErrorMessage(
                ErrorCodes.VALIDATION_MIN_LENGTH,
                `Length of field ${key} should be at least ${schema[key].min}`
            )
        }
        if ('max' in schema[key] && obj[key].length > schema[key].max) {
            throw new ErrorMessage(
                ErrorCodes.VALIDATION_MAX_LENGTH,
                `Length of field ${key} should be at most ${schema[key].max}`
            )
        }
        if ('regex' in schema[key]) {
            if (schema[key].regex instanceof RegExp) {
                // regex provided as plain RegExp
                if (!schema[key].regex.test(obj[key])) {
                    throw new ErrorMessage(
                        ErrorCodes.VALIDATION_REGEX,
                        `Field ${key} does not match ${schema[key].regex}`
                    )
                }
            } else {
                // regex provided as (pattern, message) pair
                if (!schema[key].regex.pattern.test(obj[key])) {
                    throw new ErrorMessage(
                        ErrorCodes.VALIDATION_REGEX,
                        schema[key].regex.message
                    )
                }
            }
        }
        if ('in' in schema[key]) {
            if (!schema[key].in.includes(obj[key])) {
                throw new ErrorMessage(
                    ErrorCodes.VALIDATION_IN,
                    `Field value is not one of ${schema[key].in}`
                )
            }
        }
    }
}
