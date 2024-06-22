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
            let response = await fetch(
                `${authServiceApiUrl}/auth/authenticated`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: req.cookies.token }),
                }
            )

            const json = await response.json()

            // service returned 5xx
            if (~~(response.status / 100) == 5) {
                throw json
            }

            // service returned NOT_AUTHENTICATED
            if (response.status == 401) {
                return new JSONResponse(403, {
                    code: ErrorCodes.INVALID_TOKEN,
                    message: 'Your token is invalid',
                })
            }

            // service returned 4xx
            if (~~(response.status / 100) == 4) {
                throw json
            }

            req.locals = { ...req.locals, ...json }

            // else let it pass
            return await next(req, res)
        } catch (e) {
            console.error(e)
            return new InternalError()
        }
    }
}
