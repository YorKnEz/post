import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
})

const query = async (query, params) => {
    await pool.query('set search_path to post')
    return await pool.query(query, params)
}

const getClient = async () => {
    const client = await pool.connect()
    await client.query('set search_path to post')
    return client
}

export default {
    query,
    getClient,
}
