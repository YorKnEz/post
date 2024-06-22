export const getCorsMiddleware = (
    origins,
    methods = 'GET, POST, PUT, DELETE, OPTIONS',
    headers = 'Origin, Content-Type'
) => {
    return async (req, res, next) => {
        if (req.headers.origin && origins.includes(req.headers.origin)) {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
            res.setHeader('Access-Control-Allow-Methods', methods)
            res.setHeader('Access-Control-Allow-Headers', headers)
            res.setHeader('Access-Control-Allow-Credentials', true)
        }

        if (req.method == 'OPTIONS') {
            res.statusCode = 200
            res.end()
            return
        }

        return await next(req, res)
    }
}
