import dotenv from 'dotenv'

import { App, WebServer } from '../../lib/routing/index.js'
import {
    albums_router,
    annotations_router,
    lyrics_router,
    poems_router,
    posts_router,
    users_router,
} from './routers/index.js'
import { router as test_router } from './test/test_router.js'

dotenv.config()

const hostname = process.env.HOST
const port = process.env.PORT

const web_routes = {
    '/docs': {
        '': 'index.html',
        '*': '',
    },
    '/favicon.ico': 'dist/favicon-32x32.png',
}

const app = new App()

app.add(albums_router)
// app.add(annotations_router)
// app.add(lyrics_router)
app.add(poems_router)
// app.add(posts_router)
app.add(users_router)
app.add(test_router)

app.add(new WebServer(process.env.DOCS_LOCATION, web_routes))

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})
