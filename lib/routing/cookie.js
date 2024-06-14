const options_schema = {
    regular: ['expires', 'maxAge', 'domain', 'path'],
    flags: ['secure', 'httpOnly'],
}

export function setCookie(values = {}, options = {}) {
    let cookie = ''
    for (const key in values) {
        cookie += `${key}=${values[key]}; `
    }

    for (const option of options_schema.regular) {
        if (options[option]) {
            cookie += `${option.charAt(0).toUpperCase() + option.slice(1)}=${options[option]}; `
        }
    }

    for (const option of options_schema.flags) {
        if (options[option]) {
            cookie += `${option.charAt(0).toUpperCase() + option.slice(1)}; `
        }
    }

    this.setHeader('Set-Cookie', cookie)
}
