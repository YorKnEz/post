import { __fetch } from './index.js'
import env from '../env.js'

const API_URL = env.AUTH_SERVICE_API_URL

export const register = async (data) => {
    await __fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

export const verify = async (token) => {
    await __fetch(`${API_URL}/auth/verify?token=${token}`, { method: 'POST' })
}

export const login = async (data) => {
    await __fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(data),
    })
}
