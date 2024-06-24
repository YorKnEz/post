import { ErrorCodes, JSONResponse, getAuthMiddleware } from 'web-lib'

export * from './email.js'
export * from './validation.js'

export const authMiddleware = getAuthMiddleware(
    process.env.AUTH_SERVICE_API_URL
)

export const adminMiddleware = async (req, res, next) => {
    if (!(req.locals.userRoles & 0b10)) {
        return new JSONResponse(403, {
            code: ErrorCodes.UNAUTHORIZED,
            message: 'You are not an admin'
        })
    }

    return await next(req, res)
}
