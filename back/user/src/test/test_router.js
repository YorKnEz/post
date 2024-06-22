import { JSONResponse, Router } from '../../../../lib/routing/index.js'

export const router = new Router('Test Router', '/api/test')

router.post('/', async (req, res) => {
    return new JSONResponse(200, 'Hello World')
})
