// load env before anything else
import env from './utils/env.js'

import { App, WebServer, getCorsMiddleware } from 'web-lib'
import {
    albums_router,
    annotations_router,
    lyrics_router,
    poems_router,
    posts_router,
} from './routers/index.js'


const hostname = process.env.HOST
const port = process.env.PORT

const app = new App()

const allowList = [
    'http://localhost:3000',
    'https://localhost:3000',
    // `http://${process.env.HOST}:${process.env.PORT}`,
]

app.middleware(getCorsMiddleware(allowList))

app.use('/api/albums', albums_router)
app.use('/api/annotations', annotations_router)
app.use('/api/lyrics', lyrics_router)
app.use('/api/poems', poems_router)
app.use('/api/posts', posts_router)

const web_routes = {
    '': 'index.html',
    '/favicon.ico': 'favicon-32x32.png',
    '*': '',
}

app.use('/docs', new WebServer(process.env.DOCS_LOCATION, web_routes))

app.listen(port, hostname)
