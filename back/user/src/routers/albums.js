import { JSONResponse, Router } from 'web-lib'
import * as db from '../db/index.js'
import { ErrorCodes, InternalError, SuccessCodes } from '../utils/index.js'

export const router = new Router('Albums Router')

router.get('/', async (req, res) => {
    // TODO: add some form of safe conversion to router
    req.query.start = parseInt(req.query.start)
    req.query.count = parseInt(req.query.count)

    const client = await db.getClient()

    try {
        await client.query('begin')
        let result = await client.query('select find_albums($1)', [req.query])

        console.log(result)

        result = await client.query(
            `fetch all from "${result.rows[0].find_albums}"`
        )

        await client.query('commit')

        return JSONResponse(200, result.rows)
    } catch (e) {
        console.error(e)
        await client.query('rollback')
        return InternalError()
    }
})

router.post('/', async (req, res) => { })

router.get('/:id', async (req, res) => {
    const result = await db.query('select find_album_by_id($1)', [
        req.params.id,
    ])

    const entity = result.rows[0].find_album_by_id

    console.log(entity)

    if (entity == null) {
        return new JSONResponse(404, {
            code: ErrorCodes.ALBUM_NOT_FOUND,
            message: 'Album not found',
        })
    }

    return JSONResponse(200, result.rows[0].find_album_by_id)
})

router.patch('/:id', async (req, res) => { })

router.delete('/:id', async (req, res) => {
    await db.query('call delete_album($1)', [req.params.id])

    return new JSONResponse(200, {
        code: SuccessCodes.ALBUM_DELETED,
        message: 'Album deleted successfully',
    })
})
