import dotenv from 'dotenv'
import fs from 'fs'

import { App, WebServer } from '../../lib/routing/index.js'

dotenv.config()

const hostname = process.env.HOST
const port = process.env.PORT

const app = new App({
    key: fs.readFileSync('./cert.key'),
    cert: fs.readFileSync('./cert.pem'),
})

const web_routes = {
    '/assets': { '*': 'assets' },
    '/css': { '*': 'css' },
    '/docs': {
        '': 'docs/index.html',
        '*': 'docs',
    },
    '/favicon.ico': 'assets/favicon.ico',
    '': 'src/pages/home/index.html',
    '/add-poem': 'src/pages/add_poem/index.html',
    '/dashboard': 'src/pages/dashboard/index.html',
    '/login': 'src/pages/login/index.html',
    '/poem': 'src/pages/poem/index.html',
    '/profile': 'src/pages/profile/index.html',
    '/register': 'src/pages/register/index.html',
    '/reset-password': 'src/pages/reset_password/index.html',
    '/verify': 'src/pages/verify/index.html',
    '/src': { '*': 'src' },
}

app.use(
    '/',
    new WebServer(process.env.CONTENT_LOCATION, web_routes, {
        envLocation: `${process.env.CONTENT_LOCATION}/src/env.js`,
        env: { API_URL: process.env.API_URL },
    })
)

app.listen(port, hostname)
