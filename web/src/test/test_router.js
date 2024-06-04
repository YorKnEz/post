import { Router } from '../routing/index.js'

export const router = new Router('Test Router', '/test')

router.get('/', async (_, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('Hello World')
})
