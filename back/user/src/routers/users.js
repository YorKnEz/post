import { JSONResponse, Router } from '../../../../lib/routing/index.js'
import * as db from '../db/index.js'
import { ErrorCodes, SuccessCodes, InternalError } from '../utils/codes.js'

export const router = new Router('Users Router', '/api/users')

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

    const userData = {
        ...req.body,
        verified: 0,
        roles: 0,
        albums_count: 0,
        albums_contributions: 0,
        poems_count: 0,
        poems_contributions: 0,
        created_lyrics_count: 0,
        translated_lyrics_count: 0,
        lyrics_contributions: 0,
        annotations_count: 0,
        annotations_contributions: 0
    }

    try {
        //left off:
        //Q: de ce nu recunoaste procedurile stocate
        //   chiar daca dau cast explicit la jsonb?
        //A: schema mea se numea public nu post

        const result = await client.query('select insert_user($1)', [userData])

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
    const client = await db.getClient()
    try {
        const updatedUserData = {
            ...req.body,
            id: req.params.id
        }
        const result = await client.query('select update_user($1)', [
            updatedUserData
        ])
        return new JSONResponse(200, result.rows[0])
        // res.statusCode = 200
        // res.setHeader('Content-Type', 'application/json')
        // res.end(JSON.stringify(result.rows[0]))
    } catch (e) {
        console.error(e)
        // res.statusCode = 500
        // res.setHeader('Content-Type', 'text/plain')
        // res.end('Internal server error')
        await client.query('rollback')
        return new InternalError()
    }
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
