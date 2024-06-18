// load env before anything else
import env from './utils/env.js'

import { App, WebServer } from 'web-lib'

import { auth_router } from './routers/index.js'

const hostname = process.env.HOST
const port = process.env.PORT

const app = new App()

const allowList = [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://localhost:4000',
]

app.middleware(async (req, res, next) => {
    if (req.headers.origin) {
        if (!allowList.includes(req.headers.origin)) {
            return
        }

        res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
        res.setHeader('Access-Control-Allow-Credentials', true)
    }

    return await next(req, res)
})

app.use('/api/auth', auth_router)

const web_routes = {
    '': 'index.html',
    '/favicon.ico': 'favicon-32x32.png',
    '*': '',
}

app.use('/docs', new WebServer(process.env.DOCS_LOCATION, web_routes))

app.listen(port, hostname)
