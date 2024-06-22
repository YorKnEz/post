import { __fetch } from './index.js'
import env from '../env.js'

const API_URL = env.LYRICAL_SERVICE_API_URL

export const getPoems = async (data) => {
    return await __fetch(
        `${API_URL}/poems?start=${data.start}&count=${data.count}&sort=${data.sort}&order=${data.order}`,
        { method: 'GET' }
    )
}
