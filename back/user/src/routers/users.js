import {
    ErrorCodes,
    SuccessCodes,
    InternalError,
    JSONResponse,
    Router,
    toCamel,
} from 'web-lib'
import db from '../db/index.js'
import { authMiddleware } from '../utils/index.js'

export const router = new Router('Users Router')

router.get('/', async (req, res) => {
    req.query.start = parseInt(req.query.start)
    req.query.count = parseInt(req.query.count)

    try {
        let result = await db.query('select find_user_cards($1)', [req.query])

        return new JSONResponse(200, toCamel(result.rows[0].find_user_cards))
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})

router.get('/:id', async (req, res) => {
    try {
        let result = await db.query('select find_user_by_id($1)', [
            req.params.id,
        ])

        return new JSONResponse(200, toCamel(result.rows[0].find_user_by_id))
    } catch (e) {
        // db threw 404
        if (e.code == 'P0001' && e.message == 'user not found') {
            return new JSONResponse(404, {
                code: ErrorCodes.USER_NOT_FOUND,
                message: 'User not found',
            })
        }

        console.error(e)
        return new InternalError()
    }
})

const auth_router = new Router('User Auth Router')

router.use('/', auth_router)

auth_router.middleware(authMiddleware)

auth_router.post('/', async (req, res) => { })

auth_router.patch('/:id', async (req, res) => { })

auth_router.delete('/:id', async (req, res) => {
    try {
    if (!(req.locals.userRoles & 0b10)) {
        return new JSONResponse(403, {
            code: ErrorCodes.UNAUTHORIZED,
            message: 'You are not an admin',
        })
    }

    await db.query('call delete_user($1)', [req.params.id])

    return new JSONResponse(200, {
        code: SuccessCodes.USER_DELETED,
        message: 'User deleted successfully',
    })
} catch (e) {
    // db threw 404
    if (e.code == 'P0001' && e.message == 'user not found') {
        return new JSONResponse(404, {
            code: ErrorCodes.USER_NOT_FOUND,
            message: 'User not found',
        })
    }

    console.error(e)
    return new InternalError()
}
})

auth_router.put('/:id/active-request', async (req, res) => {
    if (req.params.id != req.locals.userId) {
        return new JSONResponse(403, {
            code: ErrorCodes.UNAUTHORIZED,
            message: `You are not the user with id ${req.params.id}`,
        })
    }

    if (req.locals.userRoles & 0b1) {
        return new JSONResponse(403, {
            code: ErrorCodes.UNAUTHORIZED,
            message: 'You are already a poet',
        })
    }

    try {
        await db.query('insert into requests(requester_id) values ($1)', [
            req.params.id,
        ])

        return new JSONResponse(200, {
            code: SuccessCodes.REQUEST_MADE,
            message:
                'Request made successfully, you will be notified by email when the request will be evaluated',
        })
    } catch (e) {
        if (e.code == 23503) {
            if (e.constraint == 'requests_u1') {
                return new JSONResponse(403, {
                    code: ErrorCodes.ALREADY_ACTIVE_REQUEST,
                    message: 'You already have an active request',
                })
            } else if (e.constraint == 'requests_f1') {
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

auth_router.post('/:id/active-request', async (req, res) => {
    try {
        let result = await db.query(
            'select post_id from requests where requester_id = $1',
            [req.params.id]
        )

        let hasActiveReq = false

        for (const request of toCamel(result.rows)) {
            if (request.postId == null) {
                hasActiveReq = true
                break
            }
        }

        return new JSONResponse(200, { result: hasActiveReq })
    } catch (e) {
        return new InternalError()
    }
})
