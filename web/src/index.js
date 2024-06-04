import { fileURLToPath } from 'url'
import { dirname } from 'path'

import { App, WebServer } from './routing/index.js'
import { router as test_router } from './test_router.js'

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

app.add(test_router, 'API Router', '/api')

app.add(new WebServer(__dirname, web_routes), 'Web Server')

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})
