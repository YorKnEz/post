import bcrypt from 'bcrypt'

export const hash = (text) => {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(text, salt)

    return { salt, hash }
}
