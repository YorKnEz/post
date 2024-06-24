const snake = /^[a-z][a-z0-9]*(_[a-z][a-z0-9]*)*$/
const camel = /_[a-z]/g

// convert snake case string to camel case
export const stringToCamel = (string) =>
    snake.test(string)
        ? string.replace(camel, (x) => x[1].toUpperCase())
        : string

// convert arrays, objects and strings to camel case
export const toCamel = (obj) => {
    if (obj instanceof Array) {
        obj = obj.map((o) => toCamel(o))
    } else if (obj instanceof Object) {
        const newObj = {}
        for (const key in obj) {
            newObj[stringToCamel(key)] = toCamel(obj[key])
        }
        return newObj
    } else if (obj instanceof String) {
        return stringToCamel(obj)
    }

    return obj
}
