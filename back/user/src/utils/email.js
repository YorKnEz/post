import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

const sendEmail = async (to, subject, htmlPath, vars) => {
    let html = fs.readFileSync(htmlPath, 'utf8')

    for (const key in vars) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        html = html.replace(regex, vars[key])
    }

    return await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    })
}

export const sendVerifyAccountEmail = async (to, name, token) => {
    try {
        const info = await sendEmail(
            to,
            'PoST - Verify your account',
            path.join(__dirname, '../views/verify-account.html'),
            {
                name,
                link: `${process.env.FRONTEND_URL}/verify?token=${token}`,
            }
        )

        console.log('Email sent:', info.response)
    } catch (e) {
        console.log('Error:', e)
    }
}

export const sendChangeCredentialEmail = async (to, name, resource, token) => {
    try {
        const info = await sendEmail(
            to,
            `PoST - Reset your ${resource}`,
            path.join(__dirname, '../views/change-request.html'),
            {
                name,
                resource,
                link: `${process.env.FRONTEND_URL}/reset?type=${resource}&token=${token}`,
            }
        )

        console.log('Email sent:', info.response)
    } catch (e) {
        console.log('Error:', e)
    }
}
