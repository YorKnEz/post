import nodemailer from 'nodemailer'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

export const sendEmail = async (to, subject, htmlPath, vars) => {
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

export const sendRequestSolvedEmail = async (to, data) => {
    try {
        const info = await sendEmail(
            to,
            'PoST - Request update',
            path.join(__dirname, '../views/request-solved.html'),
            data
        )

        console.log('Email sent:', info.response)
    } catch (e) {
        console.log('Error:', e)
    }
}
