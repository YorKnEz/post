import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
})

export const query = async (query, params) => {
    await pool.query('set search_path to post')
    return await pool.query(query, params)
}

export const getClient = async () => {
    const client = await pool.connect()
    await client.query('set search_path to post')
    return client
}
