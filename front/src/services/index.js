export * from './admin.js'
export * from './auth.js'
export * from './images.js'
export * from './lyrical.js'
export * from './users.js'

// check if status code is in [200, 300) by checking 3rd digit value
const success = (status) => status / 100 == 2

export const __fetch = async (url, options) => {
    if (options.body) {
        // attach application/json header if the body is a valid json
        try {
            JSON.parse(options.body)

            if (!options.headers) {
                options = { ...options, headers: {} }
            }

            if (!options.headers['Content-Type']) {
                options = {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Content-Type': 'application/json',
                    },
                }
            }
        } catch (e) {}
    }

    const response = await fetch(url, options)

    const json = await response.json()

    if (!success(response.status)) {
        throw json
    }

    return json
}
