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
