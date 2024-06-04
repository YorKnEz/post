import { fileURLToPath } from 'url'
import { dirname } from 'path'

import { App, WebServer } from './routing/index.js'
import {
    albums_router,
    annotations_router,
    lyrics_router,
    poems_router,
    posts_router,
    users_router,
} from './routers/index.js'
import { router as test_router } from './test/test_router.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const hostname = 'localhost'
const port = 3000

const web_routes = {
    '/css': { '*': '../../css' },
    '/fonts': { '*': '../../fonts' },
    '/img': { '*': '../../img' },
    '/js': { '*': '../../js' },
    '/docs': {
        '': '../dist/index.html',
        '*': '../dist',
    },
    '/': '../../pages/index.html',
    '/add_poem': '../../pages/add_poem/index.html',
}

const app = new App('/api')

// app.add(albums_router)
// app.add(annotations_router)
// app.add(lyrics_router)
// app.add(poems_router)
// app.add(posts_router)
app.add(users_router)
users_router.test()
app.add(test_router)
test_router.test()

app.add(new WebServer(__dirname, web_routes))

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})
