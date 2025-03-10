import {
    ErrorCodes,
    InternalError,
    JSONResponse,
    Router,
    SuccessCodes,
    toCamel,
    validate,
} from 'web-lib'
import {
    annotationSchema,
    authMiddleware,
    poemSchema,
    poemUpdateSchema,
    meyersDiff,
} from '../utils/index.js'
import db from '../db/index.js'

export const router = new Router('Poems Router')

router.get('/', async (req, res) => {
    req.query.start = parseInt(req.query.start)
    req.query.count = parseInt(req.query.count)

    try {
        if (req.locals.userRoles && req.locals.userRoles & 0b10) {
            req.query.all = true
        }

        let result = await db.query('select find_poem_cards($1)', [req.query])

        return new JSONResponse(200, toCamel(result.rows[0].find_poem_cards))
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})

router.get('/suggestions', async (req, res) => {
    try {
        let result = await db.query('select find_poem_cards($1)', [
            {
                ...req.query,
                start: 0,
                count: 5,
                sort: 'popular',
                order: 'desc',
            },
        ])

        return new JSONResponse(200, toCamel(result.rows[0].find_poem_cards))
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})

router.get('/:id', async (req, res) => {
    try {
        let result = await db.query('select find_poem_by_id($1)', [
            req.params.id,
        ])

        return new JSONResponse(200, toCamel(result.rows[0].find_poem_by_id))
    } catch (e) {
        // db threw 404
        if (e.code == 'P0001' && e.message == 'poem not found') {
            return new JSONResponse(404, {
                code: ErrorCodes.POEM_NOT_FOUND,
                message: 'Poem not found',
            })
        }

        console.error(e)
        return new InternalError()
    }
})

router.get('/:id/translations', async (req, res) => {
    try {
        let result = await db.query('select find_poem_translations($1)', [
            req.params.id,
        ])

        return new JSONResponse(
            200,
            toCamel(result.rows[0].find_poem_translations)
        )
    } catch (e) {
        console.error(e)
        // db threw 404
        if (e.code == 'P0001' && e.message == 'poem not found') {
            return new JSONResponse(404, {
                code: ErrorCodes.POEM_NOT_FOUND,
                message: 'Poem not found',
            })
        }

        console.error(e)
        return new InternalError()
    }
})

const auth_router = new Router('Poems Auth Router')

router.use('/', auth_router)

auth_router.middleware(authMiddleware)

auth_router.post('/', async (req, res) => {
    try {
        // validate the user data
        validate(req.body, poemSchema)
    } catch (e) {
        return new JSONResponse(400, e.obj())
    }

    if (!req.body.cover) {
        req.body.cover = `${process.env.IMAGE_SERVICE_API_URL}/images/default-poem-cover`
    }

    try {
        if (!req.body.authorId) {
            req.body.authorId = req.locals.userId
        }

        let result = await db.query('select add_poem($1, $2)', [
            req.locals.userId,
            req.body,
        ])

        return new JSONResponse(200, toCamel(result.rows[0].add_poem))
    } catch (e) {
        if (e.code == 23503 && e.constraint == 'poems_f2') {
            return new JSONResponse(404, {
                code: ErrorCodes.POEM_NOT_FOUND,
                message: 'Poem not found',
            })
        }

        if (e.code == 23503 && e.constraint == 'poems_f4') {
            return new JSONResponse(404, {
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'Author not found',
            })
        }
        console.error(e)
        return new InternalError()
    }
})

auth_router.patch('/:id', async (req, res) => {
    try {
        // validate the user data
        validate(req.body, poemUpdateSchema)
    } catch (e) {
        return new JSONResponse(400, e.obj())
    }

    const client = await db.getClient()

    try {
        await client.query('begin')
        let result = await client.query(
            'select content, annotations from poems_view where id = $1',
            [req.params.id]
        )
        const oldContent = result.rows[0].content
        const annotations = result.rows[0].annotations

        const updatedAnnotations = meyersDiff(
            oldContent,
            req.body.content,
            annotations
        )

        await client.query('delete from annotations where id = any($1::int[])', [
            updatedAnnotations.filter(ann => ann.offset == -1).map(ann => ann.id),
        ])

        result = await client.query('select update_poem($1, $2, $3);', [
            req.params.id,
            req.locals.userId,
            req.body,
        ])

        await client.query('commit')
        return new JSONResponse(200, toCamel(result.rows[0].update_poem))
    } catch (e) {
        await client.query('rollback')
        // db threw 404
        if (e.code == 'P0001' && e.message == 'poem not found') {
            return new JSONResponse(404, {
                code: ErrorCodes.POEM_NOT_FOUND,
                message: 'Poem not found',
            })
        }

        console.error(e)
        return new InternalError()
    }
})

auth_router.delete('/:id', async (req, res) => {
    try {
        if (!(req.locals.userRoles & 0b10)) {
            return new JSONResponse(403, {
                code: ErrorCodes.UNAUTHORIZED,
                message: 'You are not an admin',
            })
        }

        await db.query('call delete_poem($1)', [req.params.id])

        return new JSONResponse(200, {
            code: SuccessCodes.POEM_DELETED,
            message: 'Poem deleted successfully',
        })
    } catch (e) {
        if (e.code == 'P0001' && e.message == 'poem not found') {
            return new JSONResponse(404, {
                code: ErrorCodes.POEM_NOT_FOUND,
                message: 'Poem not found',
            })
        }

        console.error(e)
        return new InternalError()
    }
})

auth_router.post('/:id/translations', async (req, res) => {
    try {
        // validate the user data
        validate(req.body, poemSchema)
    } catch (e) {
        return new JSONResponse(400, e.obj())
    }

    if (!req.body.cover) {
        req.body.cover = `${process.env.IMAGE_SERVICE_API_URL}/images/default-poem-cover`
    }

    try {
        if (!req.body.authorId) {
            req.body.authorId = req.locals.userId
        }

        let result = await db.query('select add_poem($1, $2)', [
            req.locals.userId,
            { ...req.body, poemId: req.params.id },
        ])

        return new JSONResponse(200, toCamel(result.rows[0].add_poem))
    } catch (e) {
        if ((e.code = 23503)) {
            if (e.constraint == 'poems_u1') {
                return new JSONResponse(400, {
                    code: ErrorCodes.ALREADY_TRANSLATED,
                    message: 'Poem already has a translation in this language',
                })
            }

            if (e.constraint == 'poems_f2') {
                return new JSONResponse(404, {
                    code: ErrorCodes.POEM_NOT_FOUND,
                    message: 'Poem not found',
                })
            }

            if (e.constraint == 'poems_f4') {
                return new JSONResponse(404, {
                    code: ErrorCodes.USER_NOT_FOUND,
                    message: 'Author not found',
                })
            }
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
                code: ErrorCodes.POEM_NOT_FOUND,
                message: 'Poem not found',
            })
        }

        console.error(e)
        return new InternalError()
    }
})
