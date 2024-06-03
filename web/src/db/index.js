import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
    user: 'yorknez',
    host: 'localhost',
    database: 'postgres',
    password: '',
    port: 5432,
})


export const query = async (query, params) => {
    await pool.query('set search_path to post')
    return await pool.query(query, params)
}

export const getClient = async () => {
    return await pool.connect()
}
