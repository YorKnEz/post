import crypto from 'crypto'

export const base36token = () => {
    const hexString = crypto.randomBytes(64).toString('hex')
    return BigInt(`0x${hexString}`).toString(36)
}
