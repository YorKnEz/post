import { ErrorCodes, InternalError, JSONResponse } from '../../index.js'

export const getAuthMiddleware = (authServiceApiUrl) => {
    return async (req, res, next) => {
        if (!req.cookies.token) {
            return new JSONResponse(401, {
                code: ErrorCodes.NOT_AUTHENTICATED,
                message: 'You must be logged in',
            })
        }

        try {
            let response = await fetch(`${authServiceApiUrl}/auth/authenticated`, {
                method: 'POST',
                body: JSON.stringify({ token: req.cookies.token }),
            })

            // service returned InternalError
            if (response.status == 500) {
                return new InternalError()
            }

            // service returned NOT_AUTHENTICATED
            if (response.status == 401) {
                return new JSONResponse(403, {
                    code: ErrorCodes.INVALID_TOKEN,
                    message: 'Your token is invalid',
                })
            }

            req.locals = { ...req.locals, ...await response.json() }

            // else let it pass
            return await next(req, res)
        } catch (e) {
            console.error(e)
            return new InternalError()
        }
    }
}
