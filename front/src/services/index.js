import { success } from '../utils/api.js'

export * from './auth.js'
export * from './lyrical.js'
export * from './users.js'

export const __fetch = async (...options) => {
    const response = await fetch(...options)

    const json = await response.json()

    if (!success(response.status)) {
        throw json
    }

    return json
}
