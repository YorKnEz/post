const options_schema = {
    regular: ['expires', 'maxAge', 'domain', 'path', 'sameSite'],
    flags: ['secure', 'httpOnly'],
}

// parses the cookie header (if present) and extracts it's values
export function getCookie(cookie) {
    // assumed the split is by '; '
    return cookie.split('; ').reduce((obj, pair) => {
        if (pair.length == 0) {
            return obj
        }

        const [k, v] = pair.split('=')
        obj[k] = v
        return obj
    }, {})
}

// given some cookie values and options, composes a cookie header
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

    cookie.slice(0, -2)

    this.setHeader('Set-Cookie', cookie)
}
