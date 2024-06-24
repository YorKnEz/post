import {
    ErrorCodes,
    InternalError,
    JSONResponse,
    Router,
    SuccessCodes,
    toCamel,
} from 'web-lib'
import db from '../db/index.js'
import {
    authMiddleware,
    adminMiddleware,
    sendRequestSolvedEmail,
} from '../utils/index.js'

export const router = new Router('Admin Router')

router.middleware(authMiddleware)
router.middleware(adminMiddleware)

router.get('/stats', async (req, res) => {
    try {
        let result = await db.query('select find_statistics();')

        return new JSONResponse(200, toCamel(result.rows[0].find_statistics))
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})

router.get('/requests', async (req, res) => {
    req.query.start = parseInt(req.query.start)
    req.query.count = parseInt(req.query.count)

    try {
        let result = await db.query('select find_requests($1);', [req.query])

        return new JSONResponse(200, toCamel(result.rows[0].find_requests))
    } catch (e) {
        return new InternalError()
    }
})

router.post('/requests/:id', async (req, res) => {
    try {
        let result = await db.query('select update_request($1, $2)', [
            req.params.id,
            req.body.approve,
        ])

        // start a task to notify the user that their request has been handled
        const task = async () => {
            try {
                const { email, name, type, extraData } =
                    result.rows[0].update_request

                const data = {
                    name,
                    result: req.body.approve ? 'approved' : 'denied',
                }

                if (type == 'user') {
                    data.reason = 'becoming a poet'
                } else if (type == 'annotation') {
                    data.reason = `approving <a href="${process.env.FRONTEND_URL}/${type}/${extraData.poemId}#${extraData.id}">your annotation</a>`
                } else {
                    data.reason = `approving <a href="${process.env.FRONTEND_URL}/${type}/${extraData.id}">${extraData.title}</a>`
                }

                await sendRequestSolvedEmail(email, data)
            } catch (e) {
                console.error(e)
            }
        }

        task()

        return new JSONResponse(200, {
            code: SuccessCodes.REQUEST_HANDLED,
            message: 'Request handled successfully',
        })
    } catch (e) {
        if (e.code == 'P0001' && e.message == 'request not found') {
            return new JSONResponse(404, {
                code: ErrorCodes.REQUEST_NOT_FOUND,
                message: 'Request not found',
            })
        }

        console.error(e)
        return new InternalError()
    }
})
