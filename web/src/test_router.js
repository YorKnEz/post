import { Router } from './routing/index.js'
import * as db from './db/index.js'
import { ErrorCodes } from './codes.js'

export const router = new Router()

router.get('/test', async (_, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('Hello World')
})

router.get('/users/:id', async (req, res) => {
    const result = await db.query('select find_user_by_id($1)', [req.params.id])

    const entity = result.rows[0].find_user_by_id

    if (entity == null) {
        res.statusCode = 404
        res.setHeader('Content-Type', 'application/json')
        res.end(
            JSON.stringify({
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'User not found',
            })
        )
        return
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(result.rows[0].find_user_by_id))
})

router.get('/users', async (req, res) => {
    await db.query('select find_users($1, $2)', [req.query, 'users_cursor'])

    const results = await db.query('fetch all from users_cursor')

    console.log(results)

    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('Hello World')

    // if (entity == null) {
    //     res.statusCode = 404
    //     res.setHeader('Content-Type', 'application/json')
    //     res.end(
    //         JSON.stringify({
    //             code: ErrorCodes.USER_NOT_FOUND,
    //             message: 'User not found',
    //         })
    //     )
    //     return
    // }
    //
    // res.statusCode = 200
    // res.setHeader('Content-Type', 'application/json')
    // res.end(JSON.stringify(result.rows[0].find_user_by_id))
})
