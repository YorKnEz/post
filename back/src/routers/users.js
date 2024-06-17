import { JSONResponse, Router } from 'web-lib'
import * as db from '../db/index.js'
import { ErrorCodes, SuccessCodes, InternalError } from '../utils/codes.js'

export const router = new Router('Users Router')

router.get('/', async (req, res) => {
    // TODO: add some form of safe conversion to router
    req.query.start = parseInt(req.query.start)
    req.query.count = parseInt(req.query.count)

    const client = await db.getClient()

    try {
        await client.query('begin')
        let result = await client.query('select find_users($1)', [req.query])

        result = await client.query(
            `fetch all from "${result.rows[0].find_users}"`
        )

        await client.query('commit')

        return new JSONResponse(200, result.rows)
    } catch (e) {
        console.error(e)
        await client.query('rollback')
        return new InternalError()
    }
})

router.post('/', async (req, res) => {
    const client = await db.getClient()

    try {
        const result = await client.query('select insert_user($1)', [req.body])

        return new JSONResponse(201, result.rows)
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})

router.get('/:id', async (req, res) => {
    const result = await db.query('select find_user_by_id($1)', [req.params.id])

    const entity = result.rows[0].find_user_by_id

    if (entity == null) {
        return new JSONResponse(404, {
            code: ErrorCodes.USER_NOT_FOUND,
            message: 'User not found',
        })
    }

    return new JSONResponse(200, result.rows[0].find_user_by_id)
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

// TODO: check if deletion actually took place
router.delete('/:id', async (req, res) => {
    await db.query('call delete_user($1)', [req.params.id])

    return new JSONResponse(200, {
        code: SuccessCodes.USER_DELETED,
        message: 'User deleted successfully',
    })
})

router.get('/:id/albums', async (req, res) => {
    const client = await db.getClient()

    try {
        await client.query('begin')
        let result = await client.query('select find_albums_by_user_id($1)', [
            req.params.id,
        ])

        result = await client.query(
            `fetch all from "${result.rows[0].find_albums_by_user_id}"`
        )

        await client.query('commit')

        return new JSONResponse(200, result.rows)
    } catch (e) {
        console.error(e)
        await client.query('rollback')
        return new InternalError()
    }
})

router.get('/:id/poems', async (req, res) => {
    const client = await db.getClient()

    try {
        await client.query('begin')
        let result = await client.query('select find_poems_by_user_id($1)', [
            req.params.id,
        ])

        result = await client.query(
            `fetch all from "${result.rows[0].find_poems_by_user_id}"`
        )

        await client.query('commit')

        return new JSONResponse(200, result.rows)
    } catch (e) {
        console.error(e)
        await client.query('rollback')
        return new InternalError()
    }
})
