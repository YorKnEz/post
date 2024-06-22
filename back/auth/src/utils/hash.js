import bcrypt from 'bcrypt'

export const __hash = (text, salt) => {
    if (!salt) {
        salt = bcrypt.genSaltSync(10)
    }

    const hash = bcrypt.hashSync(text, salt)

    return { salt, hash }
}
