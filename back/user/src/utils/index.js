import { getAuthMiddleware } from 'web-lib'

export * from './validation.js'

export const authMiddleware = getAuthMiddleware(process.env.AUTH_SERVICE_API_URL)
