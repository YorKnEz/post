import { JSONResponse, Router } from '../../../lib/routing/index.js'
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
} from '../utils/index.js'

export const router = new Router('Auth Router')

router.post('/register', async (req, res) => {
    const client = await db.getClient()

    try {
        // validate the user data
        validate(req.body, registerSchema)

        // check if the nickname exists
        let res = await client.query(
            'select nickname from users where nickname = $1',
            [req.body.nickname]
        )

        if (res.rows.length > 0) {
            throw new ErrorMessage(
                ErrorCodes.REGISTER_DUPLICATE_NICKNAME,
                'Nickname already used'
            )
        }
    } catch (e) {
        if (e instanceof ErrorMessage) {
            return new JSONResponse(400, e.obj())
        }

        console.log(e)
        return new InternalError()
    }

    // start another async task for: user creation + token creation + sending email to avoid timing attacks
    const task = async () => {
        try {
            await client.query('begin')
            const pass = hash(req.body.password)

            // TODO: maybe call user service to do this step
            let res = await client.query(
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

            const user = res.rows[0]
            const token = base36token()

            await client.query(
                "insert into tokens values($1, $2, 'emailConfirm')",
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
            console.log(e)
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
        let res = await client.query(
            "delete from tokens where value = $1 and type = 'emailConfirm' returning *",
            [req.query.token]
        )

        if (res.rows.length == 0) {
            throw new ErrorMessage(
                ErrorCodes.VERIFY_INVALID_TOKEN,
                'The given token is invalid'
            )
        }

        const user = res.rows[0]

        await client.query('update users set verified = true where id = $1', [
            user.user_id,
        ])

        return new JSONResponse(200, {
            code: SuccessCodes.VERIFIED,
            message: 'Verified successfully, you may now log in',
        })
    } catch (e) {
        if (e instanceof ErrorMessage) {
            return new JSONResponse(404, e.obj())
        }
        console.error(e)
        return new InternalError()
    }
})

router.post('/login', async (req, res) => {
    const client = await db.getClient()

    try {
        // // validate the user data
        // validate(req.body, login_schema)

        res.setCookie({ test: 'test' }, { domain: '/', secure: true })
        return new JSONResponse(200, {
            code: SuccessCodes.LOGGED_IN,
            message: 'Logged in successfully',
        })
    } catch (e) {
        if (e instanceof ErrorMessage) {
            return new JSONResponse(404, e.obj())
        }
    }
})

router.post('/request-change', async (req, res) => { })
// TODO: do we do it
// router.post('/change-email', async (req, res) => {})
router.post('/change-password', async (req, res) => { })
