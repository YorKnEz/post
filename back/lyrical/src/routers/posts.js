import {
    ErrorCodes,
    InternalError,
    JSONResponse,
    Router,
    SuccessCodes,
    toCamel,
    validate,
} from 'web-lib'
import { authMiddleware, reactionSchema } from '../utils/index.js'
import db from '../db/index.js'

export const router = new Router('Posts Router')

router.get('/', async (req, res) => {
    req.query.start = parseInt(req.query.start)
    req.query.count = parseInt(req.query.count)

    try {
        let result = await db.query('select find_post_cards($1)', [req.query])

        return new JSONResponse(200, toCamel(result.rows[0].find_post_cards))
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})

export const auth_router = new Router('Posts Router')

router.use('/', auth_router)

auth_router.middleware(authMiddleware)

auth_router.post('/:id/reactions', async (req, res) => {
    try {
        validate(req.body, reactionSchema)
    } catch (e) {
        return new JSONResponse(400, e.obj())
    }

    try {
        if (req.body.action == -1) {
            await db.query('call delete_reaction($1, $2, $3)', [
                req.params.id,
                req.locals.userId,
                req.body.type,
            ])

            return new JSONResponse(200, {
                code: SuccessCodes.REACTION_REMOVED,
                message: 'Reaction removed successfully',
            })
        }

        await db.query('call add_reaction($1, $2, $3)', [
            req.params.id,
            req.locals.userId,
            req.body.type,
        ])

        return new JSONResponse(200, {
            code: SuccessCodes.REACTION_ADDED,
            message: 'Reaction added successfully',
        })
    } catch (e) {
        if (e.code == 'P0001') {
            if (e.message == 'reaction not found') {
                return new JSONResponse(404, {
                    code: ErrorCodes.NO_REACTION,
                    message: 'Reaction not found',
                })
            }

            if (e.message == 'already reacted') {
                return new JSONResponse(400, {
                    code: ErrorCodes.ALREADY_REACTED,
                    message: 'Already reacted',
                })
            }
        }

        if (e.code == 23503) {
            if (e.constraint == 'reactions_f1') {
                return new JSONResponse(404, {
                    code: ErrorCodes.POST_NOT_FOUND,
                    message: 'Post not found',
                })
            }

            if (e.constraint == 'reactions_f2') {
                return new JSONResponse(404, {
                    code: ErrorCodes.USER_NOT_FOUND,
                    message: 'User not found',
                })
            }
        }

        console.error(e)
        return new InternalError()
    }
})

auth_router.get('/:id/reactions/:userId', async (req, res) => {
    if (req.params.userId != req.locals.userId) {
        return new JSONResponse(403, {
            code: ErrorCodes.UNAUTHORIZED,
            message: "You can't see other peoples reactions",
        })
    }

    try {
        let result = await db.query('select find_reaction($1, $2)', [
            req.params.id,
            req.params.userId,
        ])

        return new JSONResponse(200, toCamel(result.rows[0].find_reaction))
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})
