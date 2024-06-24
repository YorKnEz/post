import { __fetch } from './index.js'
import env from '../env.js'

const API_URL = env.IMAGE_SERVICE_API_URL

export const uploadImage = async (data) => {
    return await __fetch(`${API_URL}/images`, {
        method: 'POST',
        body: data,
    })
}
