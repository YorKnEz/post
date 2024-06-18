export const registerSchema = {
    firstName: {
        min: 2,
        max: 32,
        regex: /^[a-zA-Z0-9]*$/,
    },
    lastName: {
        min: 2,
        max: 32,
        regex: /^[a-zA-Z0-9]*$/,
    },
    nickname: {
        min: 4,
        max: 32,
        regex: /^[a-zA-Z0-9]*$/,
    },
    email: {
        min: 4,
        max: 256,
        regex: {
            pattern:
                /^((([!#$%&'*+\-/=?^_`{|}~\w])|([!#$%&'*+\-/=?^_`{|}~\w][!#$%&'*+\-/=?^_`{|}~\.\w]{0,}[!#$%&'*+\-/=?^_`{|}~\w]))[@]\w+([-.]\w+)*\.\w+([-.]\w+)*)$/,
            message: 'This is not a valid email',
        },
    },
    password: {
        min: 8,
        max: 64,
    },
}

export const loginSchema = {
    identifier: {},
    password: {
        min: 8,
        max: 64,
    },
}

export const requestChangeSchema = {
    email: {
        min: 4,
        max: 256,
        regex: {
            pattern:
                /^((([!#$%&'*+\-/=?^_`{|}~\w])|([!#$%&'*+\-/=?^_`{|}~\w][!#$%&'*+\-/=?^_`{|}~\.\w]{0,}[!#$%&'*+\-/=?^_`{|}~\w]))[@]\w+([-.]\w+)*\.\w+([-.]\w+)*)$/,
            message: 'This is not a valid email',
        },
    },
    type: {
        in: ['email', 'nickname', 'password'],
    },
}

export const changeEmailSchema = {
    email: {
        min: 4,
        max: 256,
        regex: {
            pattern:
                /^((([!#$%&'*+\-/=?^_`{|}~\w])|([!#$%&'*+\-/=?^_`{|}~\w][!#$%&'*+\-/=?^_`{|}~\.\w]{0,}[!#$%&'*+\-/=?^_`{|}~\w]))[@]\w+([-.]\w+)*\.\w+([-.]\w+)*)$/,
            message: 'This is not a valid email',
        },
    },
    token: {},
}

export const changeNicknameSchema = {
    nickname: {
        min: 4,
        max: 32,
        regex: /^[a-zA-Z0-9]*$/,
    },
    token: {},
}

export const changePasswordSchema = {
    password: {
        min: 8,
        max: 64,
    },
    token: {},
}
