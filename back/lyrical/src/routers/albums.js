import {
    ErrorCodes,
    InternalError,
    JSONResponse,
    Router,
    SuccessCodes,
    toCamel,
    validate,
} from 'web-lib'
import db from '../db/index.js'
import { albumSchema, albumUpdateSchema } from '../utils/validation.js'
import { authMiddleware } from '../utils/index.js'

export const router = new Router('Albums Router')

router.get('/', async (req, res) => {
    req.query.start = parseInt(req.query.start)
    req.query.count = parseInt(req.query.count)

    try {
        let result = await db.query('select find_album_cards($1)', [req.query])

        return new JSONResponse(200, toCamel(result.rows[0].find_album_cards))
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})

router.get('/suggestions', async (req, res) => {
    try {
        let result = await db.query('select find_album_cards($1)', [req.query])

        return new JSONResponse(200, toCamel(result.rows[0].find_album_cards))
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})

router.get('/:id', async (req, res) => {
    try {
        let result = await db.query('select find_album_by_id($1)', [
            req.params.id,
        ])

        return new JSONResponse(200, result.rows[0].find_album_by_id)
    } catch (e) {
        // db threw 404
        if (e.code == 'P0001' && e.message == 'album not found') {
            return new JSONResponse(404, {
                code: ErrorCodes.ALBUM_NOT_FOUND,
                message: 'Album not found',
            })
        }

        console.error(e)
        return new InternalError()
    }
})

const auth_router = new Router('Albums Auth Router')

router.use('/', auth_router)

auth_router.middleware(authMiddleware)

auth_router.post('/', async (req, res) => {
    try {
        // validate the user data
        validate(req.body, albumSchema)
    } catch (e) {
        return new JSONResponse(400, e.obj())
    }

    try {
        let result = await db.query('select add_album($1)', [req.body])

        return new JSONResponse(200, toCamel(result.rows[0].add_album))
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})

auth_router.patch('/:id', async (req, res) => {
    try {
        // validate the user data
        validate(req.body, albumUpdateSchema)
    } catch (e) {
        console.error(e)
        return new JSONResponse(400, e.obj())
    }

    try {
        let result = await db.query('select update_album($1, $2);', [
            req.params.id,
            req.body,
        ])

        return new JSONResponse(200, result.rows[0].update_album)
    } catch (e) {
        // db threw 404
        if (e.code == 'P0001' && e.message == 'album not found') {
            return new JSONResponse(404, {
                code: ErrorCodes.ALBUM_NOT_FOUND,
                message: 'Album not found',
            })
        }

        console.error(e)
        return new InternalError()
    }
})

auth_router.delete('/:id', async (req, res) => {
    try {
        await db.query('call delete_album($1)', [req.params.id])

        return new JSONResponse(200, {
            code: SuccessCodes.ALBUM_DELETED,
            message: 'Album deleted successfully',
        })
    } catch (e) {
        // db threw 404
        if (e.code == 'P0001' && e.message == 'album not found') {
            return new JSONResponse(404, {
                code: ErrorCodes.ALBUM_NOT_FOUND,
                message: 'Album not found',
            })
        }

        console.error(e)
        return new InternalError()
    }
})
