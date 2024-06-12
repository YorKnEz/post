import { Router } from '../../../lib/routing/index.js'

export const router = new Router('Test Router', '/api/test')

router.post('/', async (req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('Hello World')
})
