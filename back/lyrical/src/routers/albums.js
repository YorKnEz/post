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
        let result = await db.query('select find_album_cards($1)', [
            {
                ...req.query,
                start: 0,
                count: 5,
                sort: 'popular',
                order: 'desc',
            },
        ])

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

        return new JSONResponse(200, toCamel(result.rows[0].find_album_by_id))
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

    if (!req.body.cover) {
        req.body.cover = `${process.env.IMAGE_SERVICE_API_URL}/images/default-album-cover`
    }

    try {
        let result = await db.query('select add_album($1, $2)', [
            req.locals.userId,
            req.body,
        ])

        return new JSONResponse(200, toCamel(result.rows[0].add_album))
    } catch (e) {
        if (e.code == 23503 && e.constraint == 'albums_f2') {
            return new JSONResponse(404, {
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'User not found',
            })
        }

        console.error(e)
        return new InternalError()
    }
})

auth_router.patch('/:id', async (req, res) => {
    try {
        // validate the user data
        validate(req.body, albumUpdateSchema)
    } catch (e) {
        return new JSONResponse(400, e.obj())
    }

    try {
        let result = await db.query('select update_album($1, $2, $3);', [
            req.params.id,
            req.locals.userId,
            req.body,
        ])

        return new JSONResponse(200, toCamel(result.rows[0].update_album))
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

auth_router.post('/:id/poems', async (req, res) => {
    try {
        await db.query(
            'insert into album_poems(album_id, poem_id) values ($1, $2);',
            [req.params.id, req.body.poemId]
        )

        return new JSONResponse(200, {
            code: SuccessCodes.POEM_ADDED_TO_ALBUM,
            message: 'Poem added to album successfully',
        })
    } catch (e) {
        // duplicate key error, it means the poem is already in the album
        if (e.code == 23505) {
            return new JSONResponse(400, {
                code: ErrorCodes.POEM_ALREADY_IN_ALBUM,
                message: 'Poem is already part of this album',
            })
        } else if (e.code == 23503) {
            // either album or poem id are validating fk constraint
            if (e.constraint == 'album_poems_f1') {
                // album invalid
                return new JSONResponse(404, {
                    code: ErrorCodes.ALBUM_NOT_FOUND,
                    message: "Album doesn't exist",
                })
            }

            if (e.constraint == 'album_poems_f2') {
                // poem invalid
                return new JSONResponse(400, {
                    code: ErrorCodes.POEM_NOT_FOUND,
                    message: "Poem doesn't exist",
                })
            }
        }
        console.error(e)
        return new InternalError()
    }
})

auth_router.delete('/:id/poems/:poemId', async (req, res) => {
    try {
        let result = await db.query(
            'delete from album_poems where album_id = $1 and poem_id = $2;',
            [req.params.id, req.params.poemId]
        )

        if (result.rowCount == 0) {
            return new JSONResponse(400, {
                code: ErrorCodes.POEM_NOT_IN_ALBUM,
                message: 'Poem is not part of this album',
            })
        }

        return new JSONResponse(200, {
            code: SuccessCodes.POEM_REMOVED_FROM_ALBUM,
            message: 'Poem removed from album successfully',
        })
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})
