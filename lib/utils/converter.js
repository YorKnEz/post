const snake = /^[a-z][a-z0-9]*(_[a-z][a-z0-9]*)*$/
const camel = /_[a-z]/g

// convert snake case string to camel case
export const stringToCamel = (string) =>
    snake.test(string)
        ? string.replace(camel, (x) => x[1].toUpperCase())
        : string

export const objToCamel = (obj) => {
    const newObj = {}
    for (const key in obj) {
        newObj[stringToCamel(key)] = obj[key]
    }
    return newObj
}
