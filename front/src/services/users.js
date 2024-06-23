import { __fetch } from './index.js'
import env from '../env.js'

const API_URL = env.USER_SERVICE_API_URL

export const getUsers = async (data) => {
    return await __fetch(
        `${API_URL}/users?start=${data.start}&count=${data.count}&sort=${data.sort}&order=${data.order}`,
        { method: 'GET' }
    )
}

export const getUser = async (id) => {
    return await __fetch(`${API_URL}/users/${id}`, { method: 'GET' })
}
