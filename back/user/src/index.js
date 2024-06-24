// load env before anything else
import env from './utils/env.js'

import fs from 'fs'

import { App, WebServer, getCorsMiddleware } from 'web-lib'
import { users_router } from './routers/index.js'

const app = new App({
    key: fs.readFileSync('./cert.key'),
    cert: fs.readFileSync('./cert.pem'),
})

app.middleware(getCorsMiddleware([process.env.FRONTEND_URL]))

app.use('/api/users', users_router)

const web_routes = {
    '': 'index.html',
    '/favicon.ico': 'favicon-32x32.png',
    '\\*': '',
}

app.use(
    '/docs',
    new WebServer(process.env.DOCS_LOCATION, web_routes, {
        openapi: {
            url: process.env.PUBLIC_URL,
            path: `${process.env.DOCS_LOCATION}/swagger-initializer.js`,
        },
    })
)

app.listen(process.env.PORT, process.env.HOST)
