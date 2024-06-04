import { Router } from '../routing/index.js'
import * as db from '../db/index.js'
import { ErrorCodes, SuccessCodes } from '../codes.js'

export const router = new Router('Users Router', '/api/users')

router.get('/', async (req, res) => {
    // TODO: add some form of safe conversion to router
    req.query.start = parseInt(req.query.start)
    req.query.count = parseInt(req.query.count)

    const client = await db.getClient()

    try {
        await client.query('begin')
        await client.query('select find_users($1, $2)', [
            req.query,
            'users_cursor',
        ])

        const result = await client.query('fetch all from "users_cursor"')

        await client.query('commit')

        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(result.rows))
    } catch (e) {
        console.error(e)
        await client.query('rollback')

        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain')
        res.end('Internal server error')
    }
})

router.post('/', async (req, res) => {
    const client = await db.getClient()

    try {
        const result = await client.query('select insert_user($1)', [
            req.body
        ])
        
        res.statusCode = 201
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(result.rows))
    } catch (e) {
        console.error(e)

        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain')
        res.end('Internal server error')
    }
})

router.get('/:id', async (req, res) => {
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

router.patch('/:id', async (req, res) => {
    // const client = await db.getClient()

    // try {
    //     const result = await client.query('select insert_user($1)', [
    //         req.body
    //     ])
        
    //     res.statusCode = 201
    //     res.setHeader('Content-Type', 'application/json')
    //     res.end(JSON.stringify(result.rows))
    // } catch (e) {
    //     console.error(e)

    //     res.statusCode = 500
    //     res.setHeader('Content-Type', 'text/plain')
    //     res.end('Internal server error')
    // }
})

router.delete('/:id', async (req, res) => {
    await db.query('call delete_user($1)', [req.params.id])

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ code: SuccessCodes.USER_DELETED, message: 'User deleted successfully' }))
})

