import { JSONResponse } from '../index.js'

// Error codes to use in API responses
export const ErrorCodes = Object.freeze({
    UNKNOWN: 1001,
    USER_NOT_FOUND: 1010,
    ALBUM_NOT_FOUND: 1011,
    POEM_NOT_FOUND: 1012,
    LYRICS_NOT_FOUND: 1013,
    ANNOTATION_NOT_FOUND: 1014,
    DUPLICATE_NICKNAME: 1021,
    VERIFY_INVALID_TOKEN: 1025,
    LOGIN_VALIDATION: 1026,
    LOGIN_UNAUTHORIZED: 1027,
    LOGIN_UNVERIFIED: 1028,
    VALIDATION_MISSING_FIELD: 1030,
    VALIDATION_MIN_LENGTH: 1031,
    VALIDATION_MAX_LENGTH: 1032,
    VALIDATION_REGEX: 1033,
    VALIDATION_IN: 1034,
    VALIDATION_NOT_INT: 1035,
    VALIDATION_NOT_DATE: 1036,
    NOT_AUTHENTICATED: 1040,
    INVALID_TOKEN: 1041,
    POEM_ALREADY_IN_ALBUM: 1042,
    POEM_NOT_IN_ALBUM: 1043,
    ALREADY_TRANSLATED: 1044,
    NO_REACTION: 1045,
    ALREADY_REACTED: 1046,
    POST_NOT_FOUND: 1047,
    UNAUTHORIZED: 1048,
    INVALID_IMAGE: 1049,
    INVALID_IMAGE_TYPE: 1050,
    IMAGE_NOT_FOUND: 1051,
    ALREADY_ACTIVE_REQUEST: 1052,
    REQUEST_NOT_FOUND: 1053,
})

// Success codes to use in API responses
export const SuccessCodes = Object.freeze({
    USER_DELETED: 1,
    ALBUM_DELETED: 2,
    POEM_DELETED: 3,
    REGISTERED: 4,
    VERIFIED: 5,
    LOGGED_IN: 6,
    AUTHENTICATED: 7,
    LOGGED_OUT: 8,
    CHANGE_REQUESTED: 9,
    EMAIL_CHANGE_INITIATED: 10,
    NICKNAME_CHANGED: 11,
    PASSWORD_CHANGED: 12,
    POEM_ADDED_TO_ALBUM: 13,
    POEM_REMOVED_FROM_ALBUM: 14,
    ANNOTATION_DELETED: 15,
    LYRICS_DELETED: 16,
    REACTION_ADDED: 17,
    REACTION_REMOVED: 18,
    IMAGE_DELETED: 19,
    REQUEST_MADE: 20,
    REQUEST_HANDLED: 21,
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
