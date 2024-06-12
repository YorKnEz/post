import dotenv from 'dotenv'

import { App, WebServer } from '../../lib/routing/index.js'

dotenv.config()

const hostname = process.env.HOST
const port = process.env.PORT

const web_routes = {
    '/css': { '*': 'css' },
    '/docs': { '*': 'docs' },
    '/fonts': { '*': 'fonts' },
    '/img': { '*': 'img' },
    '/js': { '*': 'js' },
    '/favicon.ico': 'favicon.ico',
    '/': 'pages/index.html',
    '/add_poem': 'pages/add_poem/index.html',
}

const app = new App()

app.add(
    new WebServer(process.env.CONTENT_LOCATION, web_routes, {
        env: { TEST: 'testy' },
    })
)

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})
