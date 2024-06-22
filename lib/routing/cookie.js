const optionsSchema = {
    expires: ['Expires', false],
    domain: ['Domain', false],
    path: ['Path', false],
    sameSite: ['SameSite', false],
    maxAge: ['Max-Age', false], // why do they use hyphens...
    secure: ['Secure', true],
    httpOnly: ['HttpOnly', true],
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

    for (const [option, [name, flag]] of Object.entries(optionsSchema)) {
        if (options[option]) {
            if (flag) {
                cookie += `${name}; `
            } else {
                cookie += `${name}=${options[option]}; `
            }
        }
    }

    cookie.slice(0, -2)

    this.setHeader('Set-Cookie', cookie)
}
