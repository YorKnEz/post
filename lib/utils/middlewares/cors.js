export const getCorsMiddleware = (allowList) => {
    return async (req, res, next) => {
        if (req.headers.origin && allowList.includes(req.headers.origin)) {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
            res.setHeader('Access-Control-Allow-Credentials', true)
        }

        return await next(req, res)
    }
}
