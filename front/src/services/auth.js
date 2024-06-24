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
    return await __fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(data),
    })
}

export const logout = async () => {
    await __fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    })
}

export const requestChange = async (data) => {
    return await __fetch(`${API_URL}/auth/request-change`, {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

export const changeEmail = async (data) => {
    return await __fetch(`${API_URL}/auth/change-email`, {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

export const changeNickname = async (data) => {
    return await __fetch(`${API_URL}/auth/change-nickname`, {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

export const changePassword = async (data) => {
    return await __fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        body: JSON.stringify(data),
    })
}
