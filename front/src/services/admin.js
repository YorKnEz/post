import { __fetch } from './index.js'
import env from '../env.js'

const API_URL = env.LYRICAL_SERVICE_API_URL

export const getStats = async () => {
    return await __fetch(`${API_URL}/admin/stats`, {
        method: 'GET',
        credentials: 'include',
    })
}

export const getRequests = async (data) => {
    return await __fetch(
        `${API_URL}/admin/requests?type=${data.type}&start=${data.start}&count=${data.count}`,
        { method: 'GET', credentials: 'include' }
    )
}

export const solveRequest = async (id, approve) => {
    return await __fetch(`${API_URL}/admin/requests/${id}`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ approve }),
    })
}
