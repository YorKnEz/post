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
    annotationUpdateSchema,
    authMiddleware,
} from '../utils/index.js'
import db from '../db/index.js'

export const router = new Router('Annotations Router')

router.get('/:id', async (req, res) => {
    try {
        let result = await db.query('select find_annotation_by_id($1)', [
            req.params.id,
        ])

        return new JSONResponse(
            200,
            toCamel(result.rows[0].find_annotation_by_id)
        )
    } catch (e) {
        // db threw 404
        if (e.code == 'P0001' && e.message == 'annotation not found') {
            return new JSONResponse(404, {
                code: ErrorCodes.ANNOTATION_NOT_FOUND,
                message: 'Annotation not found',
            })
        }

        console.error(e)
        return new InternalError()
    }
})

const auth_router = new Router('Annotations Auth Router')

router.use('/', auth_router)

auth_router.middleware(authMiddleware)

auth_router.patch('/:id', async (req, res) => {
    try {
        // validate the user data
        validate(req.body, annotationUpdateSchema)
    } catch (e) {
        return new JSONResponse(400, e.obj())
    }

    try {
        let result = await db.query('select update_annotation($1, $2, $3);', [
            req.params.id,
            req.locals.userId,
            req.body,
        ])

        return new JSONResponse(200, toCamel(result.rows[0].update_annotation))
    } catch (e) {
        // db threw 404
        if (e.code == 'P0001' && e.message == 'annotation not found') {
            return new JSONResponse(404, {
                code: ErrorCodes.ANNOTATION_NOT_FOUND,
                message: 'Annotation not found',
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

        await db.query('call delete_annotation($1)', [req.params.id])

        return new JSONResponse(200, {
            code: SuccessCodes.ANNOTATION_DELETED,
            message: 'Annotation deleted successfully',
        })
    } catch (e) {
        // db threw 404
        if (e.code == 'P0001' && e.message == 'annotation not found') {
            return new JSONResponse(404, {
                code: ErrorCodes.ANNOTATION_NOT_FOUND,
                message: 'Annotation not found',
            })
        }

        console.error(e)
        return new InternalError()
    }
})
