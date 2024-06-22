export * from './auth.js'
export * from './images.js'
export * from './lyrical.js'
export * from './users.js'

// check if status code is in [200, 300) by checking 3rd digit value
const success = (status) => status / 100 == 2

export const __fetch = async (...options) => {
    const response = await fetch(...options)

    const json = await response.json()


    if (!success(response.status)) {
        throw json
    }

    return json
}
