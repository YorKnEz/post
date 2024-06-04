import { Router } from '../routing/index.js'
import * as db from '../db/index.js'
import { ErrorCodes, SuccessCodes } from '../codes.js'

export const router = new Router('Poems Router', '/api/poems')

router.get('/', async (req, res) => {
    // TODO: add some form of safe conversion to router
    req.query.start = parseInt(req.query.start)
    req.query.count = parseInt(req.query.count)

    const client = await db.getClient()

    try {
        await client.query('begin')
        let result = await client.query('select find_poems($1)', [req.query])

        result = await client.query(`fetch all from "${result.rows[0].find_poems}"`)

        await client.query('commit')

        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(result.rows))
    } catch (e) {
        console.error(e)
        await client.query('rollback')

        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain')
        res.end('Internal server error')
    }
})

router.post('/', async (req, res) => {})

router.get('/:id', async (req, res) => {
    const result = await db.query('select find_poem_by_id($1, \'en\')', [req.params.id])

    console.log(result)

    const entity = result.rows[0].find_poem_by_id

    if (entity == null) {
        res.statusCode = 404
        res.setHeader('Content-Type', 'application/json')
        res.end(
            JSON.stringify({
                code: ErrorCodes.POEM_NOT_FOUND,
                message: 'Poem not found',
            })
        )
        return
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(result.rows[0].find_poem_by_id))
})

router.patch('/:id', async (req, res) => {})

router.delete('/:id', async (req, res) => {
    const result = await db.query('call delete_poem($1)', [req.params.id])
    console.log(result)

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(
        JSON.stringify({
            code: SuccessCodes.POEM_DELETED,
            message: 'Poem deleted successfully',
        })
    )
})
