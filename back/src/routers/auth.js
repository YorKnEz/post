import { JSONResponse, Router } from 'web-lib'
import * as db from '../db/index.js'
import {
    ErrorCodes,
    SuccessCodes,
    validate,
    registerSchema,
    sendVerifyAccountEmail,
    base36token,
    hash,
    InternalError,
    ErrorMessage,
    loginSchema,
    FAIL_TIMEOUT,
} from '../utils/index.js'

export const router = new Router('Auth Router')

router.post('/register', async (req, res) => {
    const client = await db.getClient()

    try {
        // validate the user data
        validate(req.body, registerSchema)
    } catch (e) {
        return new JSONResponse(400, e.obj())
    }

    // check if the nickname exists
    let result = await client.query(
        'select nickname from users where nickname = $1',
        [req.body.nickname]
    )

    if (res.rows.length > 0) {
        return new JSONResponse(400, {
            code: ErrorCodes.REGISTER_DUPLICATE_NICKNAME,
            message: 'Nickname already used',
        })
    }

    // start another async task for: user creation + token creation + sending email to avoid timing attacks
    const task = async () => {
        try {
            await client.query('begin')
            const pass = hash(req.body.password)

            // TODO: maybe call user service to do this step
            let result = await client.query(
                'insert into users(first_name, last_name, nickname, email, password_hash, password_salt) values($1, $2, $3, $4, $5, $6) returning *',
                [
                    req.body.firstName,
                    req.body.lastName,
                    req.body.nickname,
                    req.body.email,
                    pass.hash,
                    pass.salt,
                ]
            )

            const user = result.rows[0]
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

        const user = result.rows[0]

        await client.query('update users set verified = true where id = $1', [
            user.user_id,
        ])

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

        const user = result.rows[0]

        // check password
        let pass = hash(req.body.password, user.password_salt)

        if (pass.hash != user.password_hash) {
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
                domain: process.env.HOST,
                path: '/',
                secure: true,
                sameSite: 'Strict',
                httpOnly: true,
            }
        )
        return new JSONResponse(200, {
            code: SuccessCodes.LOGGED_IN,
            message: 'Logged in successfully',
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
                message: 'The token is invalid'
            })
        }

        return new JSONResponse(200, result.rows[0])
    } catch (e) {
        console.error(e)
        return new InternalError()
    }
})

router.post('/request-change', async (req, res) => {})
// TODO: do we do it
// router.post('/change-email', async (req, res) => {})
router.post('/change-password', async (req, res) => {})
