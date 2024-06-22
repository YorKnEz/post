import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
})

export const query = async (query, params) => {
    await pool.query('set search_path to public')
    return await pool.query(query, params)
}

export const getClient = async () => {
    const client = await pool.connect()
    await client.query('set search_path to public')
    return client
}
