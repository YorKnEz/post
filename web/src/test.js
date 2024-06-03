const { Pool } = require('pg')

const pool = new Pool({
    user: 'yorknez',
    host: 'localhost',
    database: 'postgres',
    password: '',
    port: 5432,
})

async function callProcedure() {
    const client = await pool.connect()

    try {
        await client.query('begin')
        await client.query('set search_path to post')
        let res

        await client.query('select test($1, $2)', [
            { name: 'nick' },
            'user_cursor',
        ])

        res = await client.query(`fetch all from user_cursor`)

        for (const row of res.rows) {
            console.log(`${row.first_name} ${row.last_name}`)
        }

        await client.query('close user_cursor')

        res = await client.query('select test2($1)', [{ name: 'nick' }])
        console.log(res.rows[0])

        await client.query('select test3($1, $2)', [
            { name: 'nick' },
            'user_cursor',
        ])

        res = await client.query(`fetch all from user_cursor`)

        for (const row of res.rows) {
            console.log(row)
            // console.log(`${row.first_name} ${row.last_name}`)
        }

        await client.query('close user_cursor')

        await client.query('select find_users($1, $2)', [
            { query: 'nick', start: 0, count: 4, sort: 'new', order: 'asc'},
            'user_cursor',
        ])

        res = await client.query(`fetch all from user_cursor`)

        for (const row of res.rows) {
            console.log(row)
        }

        await client.query('close user_cursor')

        await client.query('commit')
    } catch (e) {
        await client.query('rollback')
        console.error('error ', e)
    } finally {
        client.release()
    }
}

callProcedure().catch((err) => console.error(err.stack))
