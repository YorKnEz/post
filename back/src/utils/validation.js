// simple schema validation for string fields
export const validate = (obj, schema) => { 
    for (const key in schema) {
        console.log(key)
        // check that all keys are present
        if (!key in obj) {
            throw `Missing field ${key}`
        }

        // check the requirements for each field
        if ("min" in schema[key] && obj[key].length < schema[key].min) {
            throw `Length of field ${key} should be at least ${schema[key].min}`
        }
        if ("max" in schema[key] && obj[key].length > schema[key].max) {
            throw `Length of field ${key} should be at most ${schema[key].max}`
        }
        if ("regex" in schema[key] && !schema[key].regex.test(obj[key])) {
            throw `Field ${key} does not match ${schema[key].regex}`
        }
    }
}

export const register_schema = {
    first_name: {
        min: 2,
        max: 32,
        regex: /^[a-zA-Z0-9]*$/
    },
    last_name: {
        min: 2,
        max: 32,
        regex: /^[a-zA-Z0-9]*$/
    },
    nickname: {
        min: 4,
        max: 32,
        regex: /^[a-zA-Z0-9]*$/
    },
    email: {
        min: 4,
        max: 32,
        regex: /^[a-zA-Z0-9_-]*$/
    },
    password: {
        min: 8,
        max: 64,
    }
}
