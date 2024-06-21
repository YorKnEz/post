import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

import multer from 'multer'
import {
    ErrorCodes,
    ErrorMessage,
    InternalError,
    JSONResponse,
    Router,
    SuccessCodes,
    base36token,
} from 'web-lib'

export const router = new Router('Images Router')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const allowedFileTypes = { 'image/jpeg': '.jpg', 'image/png': '.png' }

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads')

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir)
}

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir) // Uploads directory
    },
    filename: (req, file, cb) => {
        // give a 16 byte base 36 name to the file + it's extension
        cb(null, base36token(16) + allowedFileTypes[file.mimetype])
    },
})

const fileFilter = (req, file, cb) => {
    if (Object.keys(allowedFileTypes).includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(
            new ErrorMessage(
                ErrorCodes.INVALID_IMAGE_TYPE,
                'Invalid image type. Only JPEG and PNG are allowed.'
            ),
            false
        )
    }
}

const upload = multer({ storage: storage, fileFilter })

router.post('/', async (req, res) => {
    return new Promise((resolve, reject) => {
        upload.single('image')(req, res, (e) => {
            if (e) {
                if (e instanceof ErrorMessage) {
                    resolve(new JSONResponse(400, e.obj()))
                    return
                }

                resolve(
                    new JSONResponse(400, {
                        code: ErrorCodes.INVALID_IMAGE,
                        message: 'Invalid image provided',
                    })
                )
                return
            }

            // remove extension from url
            const basefilename = req.file.filename.slice(
                0,
                req.file.filename.lastIndexOf('.')
            )

            resolve(
                new JSONResponse(200, {
                    url: `${process.env.IMAGE_SERVICE_API_URL}/images/${basefilename}`,
                })
            )
        })
    })
})

router.get('/:id', async (req, res) => {
    return new Promise((resolve, reject) => {
        for (const [mimetype, ext] of Object.entries(allowedFileTypes)) {
            const imagepath = path.join(uploadDir, req.params.id + ext)
            if (fs.existsSync(imagepath)) {
                fs.readFile(imagepath, (e, data) => {
                    if (e) {
                        console.error(e)
                        resolve(new InternalError())
                    }

                    res.statusCode = 200
                    res.setHeader('Content-Type', mimetype)
                    res.end(data)
                    resolve()
                })

                return
            }
        }

        resolve(
            new JSONResponse(404, {
                code: ErrorCodes.IMAGE_NOT_FOUND,
                message: 'Image not found',
            })
        )
    })
})

router.delete('/:id', async (req, res) => {
    return new Promise((resolve, reject) => {
        // keep defaults
        if (
            req.params.id in
            ['default-album-cover', 'default-poem-cover', 'default-avatar']
        ) {
            resolve(
                new JSONResponse(404, {
                    code: ErrorCodes.IMAGE_NOT_FOUND,
                    message: 'Image not found',
                })
            )
            return
        }

        for (const [_, ext] of Object.entries(allowedFileTypes)) {
            const imagepath = path.join(uploadDir, req.params.id + ext)
            if (fs.existsSync(imagepath)) {
                fs.rm(imagepath, (e) => {
                    if (e) {
                        console.error(e)
                        resolve(new InternalError())
                    }

                    resolve(
                        new JSONResponse(200, {
                            code: SuccessCodes.IMAGE_DELETED,
                            message: 'Image deleted successfully',
                        })
                    )
                })

                return
            }
        }

        resolve(
            new JSONResponse(404, {
                code: ErrorCodes.IMAGE_NOT_FOUND,
                message: 'Image not found',
            })
        )
    })
})
