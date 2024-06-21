import dotenv from 'dotenv'
import fs from 'fs'

import { App, WebServer } from 'web-lib'

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
        env: {
            AUTH_SERVICE_API_URL: process.env.AUTH_SERVICE_API_URL,
            IMAGE_SERVICE_API_URL: process.env.IMAGE_SERVICE_API_URL,
            LYRICAL_SERVICE_API_URL: process.env.LYRICAL_SERVICE_API_URL,
            USER_SERVICE_API_URL: process.env.USER_SERVICE_API_URL,
        },
    })
)

app.listen(port, hostname)
