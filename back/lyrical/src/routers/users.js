import { InternalError, JSONResponse, Router, toCamel } from 'web-lib'
import db from '../db/index.js'

export const router = new Router('Users Router')

router.get('/:id/albums', async (req, res) => {
    req.query.start = parseInt(req.query.start)
    req.query.count = parseInt(req.query.count)

    try {
        let result = await db.query('select find_album_cards($1)', [
            { ...req.query, userId: req.params.id },
        ])

        return new JSONResponse(200, toCamel(result.rows[0].find_album_cards))
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})

router.get('/:id/poems', async (req, res) => {
    req.query.start = parseInt(req.query.start)
    req.query.count = parseInt(req.query.count)

    try {
        let result = await db.query('select find_poem_cards($1)', [
            { ...req.query, userId: req.params.id },
        ])

        return new JSONResponse(200, toCamel(result.rows[0].find_poem_cards))
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})

router.get('/:id/contributions', async (req, res) => {
    req.query.start = parseInt(req.query.start)
    req.query.count = parseInt(req.query.count)

    try {
        let result = await db.query('select find_contribution_cards($1)', [
            req.query,
        ])

        return new JSONResponse(
            200,
            toCamel(result.rows[0].find_contribution_cards)
        )
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})
