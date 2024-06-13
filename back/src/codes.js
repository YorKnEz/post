import { JSONResponse } from "../../lib/routing/index.js"

// Error codes to use in API responses
export const ErrorCodes = Object.freeze({
    UNKNOWN: 1001,
    USER_NOT_FOUND: 1010,
    ALBUM_NOT_FOUND: 1011,
    POEM_NOT_FOUND: 1012,
})

// Success codes to use in API responses
export const SuccessCodes = Object.freeze({
    USER_DELETED: 1,
    ALBUM_DELETED: 2,
    POEM_DELETED: 3,
})

export class InternalError extends JSONResponse {
    constructor() {
        super(500, { code: ErrorCodes.UNKNOWN, message: 'Internal server error' })
    }
}
