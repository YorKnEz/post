// load env before anything else
import env from './utils/env.js'

import { App, WebServer, getCorsMiddleware } from 'web-lib'
import { images_router } from './routers/index.js'

const app = new App()

app.middleware(getCorsMiddleware([process.env.FRONTEND_URL]))

app.use('/api/images', images_router)

const web_routes = {
    '': 'index.html',
    '/favicon.ico': 'favicon-32x32.png',
    '\\*': '',
}

app.use('/docs', new WebServer(process.env.DOCS_LOCATION, web_routes))

app.listen(process.env.PORT, process.env.HOST)
