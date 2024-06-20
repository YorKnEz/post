import {
    ErrorCodes,
    InternalError,
    JSONResponse,
    Router,
    toCamel,
    validate,
} from 'web-lib'
import {
    annotationSchema,
    authMiddleware,
    lyricsUpdateSchema,
} from '../utils/index.js'
import db from '../db/index.js'

export const router = new Router('Lyrics Router')

const auth_router = new Router('Lyrics Auth Router')

router.use('/', auth_router)

auth_router.middleware(authMiddleware)

auth_router.patch('/:id', async (req, res) => {
    try {
        // validate the user data
        validate(req.body, lyricsUpdateSchema)
    } catch (e) {
        return new JSONResponse(400, e.obj())
    }

    try {
        let result = await db.query('select update_lyrics($1, $2, $3)', [
            req.params.id,
            req.locals.userId,
            req.body,
        ])

        return new JSONResponse(200, toCamel(result.rows[0].update_lyrics))
    } catch (e) {
        if (e.code == 'P0001' && e.message == 'lyrics not found') {
            return new JSONResponse(404, {
                code: ErrorCodes.LYRICS_NOT_FOUND,
                message: 'Lyrics not found',
            })
        }

        if (e.code == 23503 && e.constraint == 'lyrics_f2') {
            return new JSONResponse(404, {
                code: ErrorCodes.POEM_NOT_FOUND,
                message: 'Poem not found',
            })
        }

        console.error(e)
        return new InternalError()
    }
})

auth_router.post('/:id/annotations', async (req, res) => {
    try {
        // validate the user data
        validate(req.body, annotationSchema)
    } catch (e) {
        return new JSONResponse(400, e.obj())
    }

    try {
        let result = await db.query('select add_annotation($1, $2, $3)', [
            req.params.id,
            req.locals.userId,
            req.body,
        ])

        return new JSONResponse(200, toCamel(result.rows[0].add_annotation))
    } catch (e) {
        if (e.code == 23503 && e.constraint == 'annotations_f2') {
            return new JSONResponse(404, {
                code: ErrorCodes.LYRICS_NOT_FOUND,
                message: 'Lyrics not found',
            })
        }

        console.error(e)
        return new InternalError()
    }
})
