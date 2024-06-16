import dotenv from 'dotenv'

import { App, WebServer } from '../../lib/routing/index.js'
import {
    albums_router,
    annotations_router,
    auth_router,
    lyrics_router,
    poems_router,
    posts_router,
    users_router,
} from './routers/index.js'

dotenv.config()

const hostname = process.env.HOST
const port = process.env.PORT

const app = new App()

const allowList = ['http://localhost:3000']

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

app.use('/api/albums', albums_router)
app.use('/api/annotations', annotations_router)
app.use('/api/auth', auth_router)
app.use('/api/lyrics', lyrics_router)
app.use('/api/poems', poems_router)
app.use('/api/posts', posts_router)
app.use('/api/users', users_router)

const web_routes = {
    '': 'index.html',
    '/favicon.ico': 'favicon-32x32.png',
    '*': '',
}

app.use('/docs', new WebServer(process.env.DOCS_LOCATION, web_routes))

app.listen(port, hostname)
