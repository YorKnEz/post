import { App, JSONResponse, Router } from './index.js'

const app = new App()
const router = new Router('Test Router')
const nested_router1 = new Router('Nested Test Router 1')
const nested_router2 = new Router('Nested Test Router 2')

app.use('/', router)

router.middleware((req, res, next) => {
    console.log('middleware 1')
    next()
})

router.post('/', async (req, res) => {
    return new JSONResponse(200, 'Hello World')
})

router.use('/test/:id', nested_router1)

nested_router1.middleware((req, res, next) => {
    console.log('middleware 2')
    next()
})

nested_router1.use('/a/:b', nested_router2)

nested_router2.middleware((req, res, next) => {
    console.log('middleware 3')
    next()
})

nested_router2.post('/', async (req, res) => {
    console.log(req.query, req.params, req.body)
    // return new JSONResponse(200, 'Hello World')
})

app.listen(3000, '0.0.0.0', () => {
    console.log('up')
})
