import crypto from 'crypto';

export * from './codes.js'
export * from './validation.js'
export * from './email.js'
export * from './hash.js'

export const base36token = () => {
    const hexString = crypto.randomBytes(64).toString('hex');
    return BigInt(`0x${hexString}`).toString(36);
}
