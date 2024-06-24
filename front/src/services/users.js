import { __fetch } from './index.js'
import env from '../env.js'

const API_URL = env.USER_SERVICE_API_URL

export const getUsers = async (data) => {
    return await __fetch(
        `${API_URL}/users?query=${data.query ?? ''}&start=${data.start}&count=${data.count}&sort=${data.sort}&order=${data.order}`,
        { method: 'GET' }
    )
}

export const getUsersSuggestions = async (query) => {
    return (
        await getUsers({
            query,
            start: 0,
            count: 5,
            sort: 'activity',
            order: 'desc',
        })
    ).map((user) => ({ id: user.id, value: user.nickname }))
}

export const getUser = async (id) => {
    return await __fetch(`${API_URL}/users/${id}`, { method: 'GET' })
}

export const hasPoetRequest = async (userId) => {
    return await __fetch(`${API_URL}/users/${userId}/active-request`, {
        method: 'POST',
        credentials: 'include',
    })
}

export const makePoetRequest = async (userId) => {
    return await __fetch(`${API_URL}/users/${userId}/active-request`, {
        method: 'PUT',
        credentials: 'include',
    })
}
