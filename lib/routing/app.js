import { Server } from 'http'

// The App class represents the main class used for creating a server
//
// An App allows to add custom Handlers to it, which, as the name implies, handle requests
// The handlers are called in the order of addition and the handling of the request stopts at the // first handler that is capable of handling the request
export default class App extends Server {
    static methodsWithBody = ['post', 'put', 'patch']

    constructor(prefix = '') {
        super(async (req, res) => {
            if (req.url.startsWith(this.prefix)) {
                req.url = req.url.replace(this.prefix, '')

                // try adding body to request
                if (App.methodsWithBody.includes(req.method.toLowerCase())) {
                    req.body = await this.getRequestBody(req)
                }

                for (const handler of this.handlers) {
                    const matched = await handler.handle(req, res)
                    if (matched) {
                        return
                    }
                }
            }

            console.error(`Route \`${req.url}\` not found`)
            res.statusCode = 404
            res.setHeader('Content-Type', 'text/plain')
            res.end("Couldn't find your request")
        })

        this.prefix = prefix
        this.handlers = []
    }

    getRequestBody = async (req) => {
        return new Promise((resolve, reject) => {
            req.body = []
            req.on('data', (chunk) => {
                req.body.push(chunk)
            })
                .on('end', () => {
                    resolve(JSON.parse(Buffer.concat(req.body).toString()))
                    // at this point, `req.body` has the entire request body stored in it as a string
                })
                .on('error', (e) => {
                    reject(e)
                })
        })
    }

    add = (handler) => {
        this.handlers.push(handler)
    }
}
