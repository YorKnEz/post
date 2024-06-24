import { JSONResponse } from '../../../../lib/routing/index.js'

// Error codes to use in API responses
export const ErrorCodes = Object.freeze({
    UNKNOWN: 1001,
    USER_NOT_FOUND: 1010,
    ALBUM_NOT_FOUND: 1011,
    POEM_NOT_FOUND: 1012,
    REGISTER_VALIDATION: 1020,
})

// Success codes to use in API responses
export const SuccessCodes = Object.freeze({
    USER_DELETED: 1,
    ALBUM_DELETED: 2,
    POEM_DELETED: 3,
    REGISTERED: 4,
})

export class ErrorMessage extends Error {
    constructor(code, message) {
        super(message)
        this.code = code
        this.message = message
    }

    obj() {
        return { code: this.code, message: this.message }
    }
}

export class InternalErrorMessage extends ErrorMessage {
    constructor() {
        super(ErrorCodes.UNKNOWN, 'Internal server error')
    }
}

export class InternalError extends JSONResponse {
    constructor() {
        super(500, new InternalErrorMessage().obj())
    }
}
