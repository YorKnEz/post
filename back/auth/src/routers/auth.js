import {
    ErrorCodes,
    InternalError,
    JSONResponse,
    Router,
    SuccessCodes,
    base36token,
    toCamel,
    validate,
} from 'web-lib'
import * as db from '../db/index.js'
import {
    sendVerifyAccountEmail,
    registerSchema,
    loginSchema,
    FAIL_TIMEOUT,
    requestChangeSchema,
    sendChangeCredentialEmail,
    changeEmailSchema,
    changeNicknameSchema,
    changePasswordSchema,
    __hash,
} from '../utils/index.js'

export const router = new Router('Auth Router')

// the register process is as follows:
// 1. data is validated
// 2. the user is inserted in the db with `email = null` and `new_email = given_email`
// 3. an email is sent to the given email
// 4. upon verifying the account, the email will become new_email and new_email will become null
// steps 2 and 4 are meant to make implementation of email changing easier
router.post('/register', async (req, res) => {
    const client = await db.getClient()

    try {
        // validate the user data
        validate(req.body, registerSchema)
    } catch (e) {
        console.error(e)
        return new JSONResponse(400, e.obj())
    }

    if (!req.body.avatar) {
        req.body.avatar = `${process.env.IMAGE_SERVICE_API_URL}/images/default-avatar`
    }

    // check if the nickname exists
    let result = await client.query(
        'select nickname from users where nickname = $1',
        [req.body.nickname]
    )

    if (result.rows.length > 0) {
        return new JSONResponse(400, {
            code: ErrorCodes.DUPLICATE_NICKNAME,
            message: 'Nickname already used',
        })
    }

    // start another async task for: user creation + token creation + sending email to avoid timing attacks
    const task = async () => {
        try {
            await client.query('begin')
            const pass = __hash(req.body.password)

            let result = await client.query(
                'insert into users(first_name, last_name, nickname, avatar, new_email, password_hash, password_salt) values($1, $2, $3, $4, $5, $6, $7) returning *',
                [
                    req.body.firstName,
                    req.body.lastName,
                    req.body.nickname,
                    req.body.avatar,
                    req.body.email,
                    pass.hash,
                    pass.salt,
                ]
            )

            const user = toCamel(result.rows[0])
            const token = base36token()

            await client.query(
                "insert into tokens(value, user_id, type) values($1, $2, 'emailConfirm')",
                [token, user.id]
            )

            await sendVerifyAccountEmail(
                req.body.email,
                req.body.firstName + ' ' + req.body.lastName,
                token
            )

            await client.query('commit')
        } catch (e) {
            await client.query('rollback')

            if (e.code == 23505 && e.constraint == 'users_email_key') {
                // duplicate email error, ignore
            }

            // other errors, ignore as well
            console.error(e)
        }
    }

    // whatever happens with this task, the user won't know the result, they'll just know that they
    // must check their email
    task()

    return new JSONResponse(200, {
        code: SuccessCodes.REGISTERED,
        message: 'Registered successfully',
    })
})

// the verifying process applies step 4 of registration process: `email = new_email`,
// `new_email = null` and also sets the verified status of the user to true
router.post('/verify', async (req, res) => {
    const client = await db.getClient()

    try {
        let result = await client.query(
            "delete from tokens where value = $1 and type = 'emailConfirm' returning *",
            [req.query.token]
        )

        if (result.rows.length == 0) {
            return new JSONResponse(400, {
                code: ErrorCodes.VERIFY_INVALID_TOKEN,
                message: 'The given token is invalid',
            })
        }

        const user = toCamel(result.rows[0])

        await client.query(
            'update users set verified = true, email = new_email, new_email = null where id = $1',
            [user.userId]
        )

        // invalidate all sessions after having made the change
        await client.query(
            "delete from tokens where user_id = $1 and type = 'session'",
            [user.id]
        )

        return new JSONResponse(200, {
            code: SuccessCodes.VERIFIED,
            message: 'Verified successfully, you may now log in',
        })
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})

router.post('/login', async (req, res) => {
    // in order to mitigate timing attacks, any failure except validation will cause the handler to
    // wait 5 seconds before sending the response
    //
    // if the login is successful, a response is immediately returned
    const start = performance.now()
    const client = await db.getClient()

    try {
        // validate the user data
        validate(req.body, loginSchema)
    } catch (e) {
        return new JSONResponse(400, e.obj())
    }

    let response

    try {
        // search the user by nickname or email
        let result = await client.query(
            'select * from users where nickname = $1 or email = $1',
            [req.body.identifier]
        )

        // no user found -> invalid identifier
        if (result.rows.length == 0) {
            throw new JSONResponse(401, {
                code: ErrorCodes.LOGIN_UNAUTHORIZED,
                message: 'Invalid credentials',
            })
        }

        const user = toCamel(result.rows[0])

        // check password
        let pass = __hash(req.body.password, user.passwordSalt)

        if (pass.hash != user.passwordHash) {
            throw new JSONResponse(401, {
                code: ErrorCodes.LOGIN_UNAUTHORIZED,
                message: 'Invalid credentials',
            })
        }

        // generate session token
        const token = base36token()
        await client.query(
            "insert into tokens(value, user_id, type) values($1, $2, 'session')",
            [token, user.id]
        )

        res.setCookie(
            { token },
            {
                domain: process.env.PUBLIC_DOMAIN,
                path: '/',
                secure: true,
                sameSite: 'Strict',
                httpOnly: true,
            }
        )
        return new JSONResponse(200, {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            nickname: user.nickname,
            avatar: user.avatar,
            roles: user.roles,
            contributions:
                user.albumsContributions +
                user.poemsContributions +
                user.annotationsContributions,
        })
    } catch (e) {
        if (e instanceof JSONResponse) {
            response = e
        } else {
            console.error(e)
            response = new InternalError()
        }
    }

    const end = performance.now()

    await new Promise((res) => setTimeout(res, FAIL_TIMEOUT - (end - start)))

    return response
})

router.post('/authenticated', async (req, res) => {
    const client = await db.getClient()

    try {
        let result = await client.query(
            'select t.user_id user_id, u.roles user_roles from tokens t join users u on t.user_id = u.id where t.value = $1',
            [req.body.token]
        )

        if (result.rows.length == 0) {
            return new JSONResponse(401, {
                code: ErrorCodes.NOT_AUTHENTICATED,
                message: 'The token is invalid',
            })
        }

        return new JSONResponse(200, toCamel(result.rows[0]))
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})

router.post('/logout', async (req, res) => {
    if (!req.cookies.token) {
        return new JSONResponse(400, {
            code: ErrorCodes.NOT_AUTHENTICATED,
            message: 'You are not logged in',
        })
    }

    const client = await db.getClient()

    try {
        let result = await client.query(
            "delete from tokens where type = 'session' and value = $1",
            [req.cookies.token]
        )

        if (result.rows.rowCount == 1) {
            return new JSONResponse(400, {
                code: ErrorCodes.NOT_AUTHENTICATED,
                message: 'You are not logged in',
            })
        }

        res.setCookie(
            { token: '' },
            {
                domain: process.env.PUBLIC_DOMAIN,
                path: '/',
                secure: true,
                sameSite: 'Strict',
                httpOnly: true,
                maxAge: 0,
            }
        )
        return new JSONResponse(200, {
            code: SuccessCodes.LOGGED_OUT,
            message: 'You have been logged out',
        })
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})

router.post('/request-change', async (req, res) => {
    const client = await db.getClient()

    try {
        // validate the user data
        validate(req.body, requestChangeSchema)
    } catch (e) {
        return new JSONResponse(400, e.obj())
    }

    // start another async task for: the process of sending the email since it can be vulenrable to timing attacks
    const task = async () => {
        try {
            await client.query('begin')

            // check if the nickname exists
            let result = await client.query(
                'select * from users where email = $1',
                [req.body.email]
            )

            // invalid email provided
            if (result.rows.length == 0) {
                console.log('invalid email')
                return
            }

            const user = toCamel(result.rows[0])
            const token = base36token()

            // in the case that the user already generated a credential change request, invalidate
            // it
            await client.query(
                "delete from tokens where user_id = $1 and type in ('emailChange', 'nicknameChange', 'passwordChange')",
                [user.id]
            )

            await client.query(
                'insert into tokens(value, user_id, type) values($1, $2, $3)',
                [token, user.id, req.body.type + 'Change']
            )

            await sendChangeCredentialEmail(
                req.body.email,
                user.firstName + ' ' + user.lastName,
                req.body.type,
                token
            )

            await client.query('commit')
        } catch (e) {
            await client.query('rollback')

            // other errors, ignore as well
            console.error(e)
        }
    }

    // whatever happens with this task, the user won't know the result, they'll just know that they
    // must check their email
    task()

    return new JSONResponse(200, {
        code: SuccessCodes.CHANGE_REQUESTED,
        message: 'Confirmation email sent, please check your email',
    })
})

// an email change works like this:
// 1. a user sends a change request
// 2. a confirmation email is sent on the old email of the user
// 3. the user provides a new email
// 4. if the email is invalid they will get an error, if the email is already used the process is
// stopped
// 5. the `new_email` is set to the given email, a confirmation token is generated and sent to the
// user's new email (in the meantime, the old email remains valid)
router.post('/change-email', async (req, res) => {
    const client = await db.getClient()

    try {
        // validate the user data
        validate(req.body, changeEmailSchema)
    } catch (e) {
        return new JSONResponse(400, e.obj())
    }

    // destroy the old token
    let result = await client.query(
        "delete from tokens where value = $1 and type = 'emailChange' returning *",
        [req.body.token]
    )

    if (result.rows.length == 0) {
        return new JSONResponse(400, {
            code: ErrorCodes.INVALID_TOKEN,
            message: 'Invalid token provided',
        })
    }

    const token = toCamel(result.rows[0])

    result = await client.query('select * from users where id = $1', [
        token.userId,
    ])

    const user = toCamel(result.rows[0])

    // start another async task for: initiating step 2 of changing an email
    const task = async () => {
        try {
            await client.query('begin')

            result = await client.query(
                'select id from users where email = $1',
                [req.body.email]
            )

            // don't send an email if the email is already used
            if (result.rows.length > 0) {
                console.log('email already used')
                return
            }

            result = await client.query(
                'update users set new_email = $1 where id = $2',
                [req.body.email, user.id]
            )

            const token = base36token()

            await client.query(
                "insert into tokens(value, user_id, type) values($1, $2, 'emailConfirm')",
                [token, user.id]
            )

            await sendVerifyAccountEmail(
                req.body.email,
                user.firstName + ' ' + user.lastName,
                token
            )

            await client.query('commit')
        } catch (e) {
            await client.query('rollback')

            // other errors, ignore as well
            console.error(e)
        }
    }

    // whatever happens with this task, the user won't know the result, they'll just know that they
    // must check their email
    task()

    return new JSONResponse(200, {
        code: SuccessCodes.EMAIL_CHANGE_INITIATED,
        message: 'Confirmation email sent to the new email address',
    })
})

router.post('/change-nickname', async (req, res) => {
    const client = await db.getClient()

    try {
        // validate the user data
        validate(req.body, changeNicknameSchema)
    } catch (e) {
        return new JSONResponse(400, e.obj())
    }

    // destroy the old token
    let result = await client.query(
        "delete from tokens where value = $1 and type = 'nicknameChange' returning *",
        [req.body.token]
    )

    if (result.rows.length == 0) {
        return new JSONResponse(400, {
            code: ErrorCodes.INVALID_TOKEN,
            message: 'Invalid token provided',
        })
    }

    const token = toCamel(result.rows[0])

    try {
        await client.query('update users set nickname = $1 where id = $2', [
            req.body.nickname,
            token.userId,
        ])

        // invalidate all sessions after having made the change
        await client.query(
            "delete from tokens where user_id = $1 and type = 'session'",
            [token.userId]
        )

        return new JSONResponse(200, {
            code: SuccessCodes.NICKNAME_CHANGED,
            message: 'Nickname changed successfully',
        })
    } catch (e) {
        // duplicate nickname error
        if (e.code == 23505 && e.constraint == 'users_nickname_key') {
            return new JSONResponse(400, {
                code: ErrorCodes.DUPLICATE_NICKNAME,
                message: 'Nickname already used',
            })
        }

        console.error(e)
        return new InternalError()
    }
})

router.post('/change-password', async (req, res) => {
    const client = await db.getClient()

    try {
        // validate the user data
        validate(req.body, changePasswordSchema)
    } catch (e) {
        return new JSONResponse(400, e.obj())
    }

    // destroy the old token
    let result = await client.query(
        "delete from tokens where value = $1 and type = 'passwordChange' returning *",
        [req.body.token]
    )

    if (result.rows.length == 0) {
        return new JSONResponse(400, {
            code: ErrorCodes.INVALID_TOKEN,
            message: 'Invalid token provided',
        })
    }

    const token = toCamel(result.rows[0])

    try {
        const pass = __hash(req.body.password)

        await client.query(
            'update users set password_hash = $1, password_salt = $2 where id = $3',
            [pass.hash, pass.salt, token.userId]
        )

        // invalidate all sessions after having made the change
        await client.query(
            "delete from tokens where user_id = $1 and type = 'session'",
            [token.userId]
        )

        return new JSONResponse(200, {
            code: SuccessCodes.PASSWORD_CHANGED,
            message: 'Password changed successfully',
        })
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})
