import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
})

console.log(pool)

export const query = async (query, params) => {
    // await pool.query('set search_path to post')
    return await pool.query(query, params)
}

export const getClient = async () => {
    const client = await pool.connect()
    // await client.query('set search_path to post')
    return client
}
