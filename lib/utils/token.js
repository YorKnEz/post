import crypto from 'crypto'

export const base36token = (size = 64) => {
    const hexString = crypto.randomBytes(size).toString('hex')
    return BigInt(`0x${hexString}`).toString(36)
}
