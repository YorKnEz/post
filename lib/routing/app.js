import { Server } from 'http'
import { parse } from 'node:url'

import { setCookie } from './cookie.js'
import { JSONResponse, Router } from './index.js'

// The App class represents the main class used for creating a server
//
// An App allows to add custom Handlers to it, which, as the name implies, handle requests
// The handlers are called in the order of addition and the handling of the request stopts at the // first handler that is capable of handling the request
export default class App extends Router {
    static methodsWithBody = ['post', 'put', 'patch']

    constructor() {
        super()
        this.server = Server(async (req, res) => await this.handle(req, res))
    }

    async handle(req, res) {
        // try adding body to request
        if (App.methodsWithBody.includes(req.method.toLowerCase())) {
            req.body = await this.__getRequestBody(req)
        }

        let { pathname, query } = parse(req.url, true)
        // remove query params from url
        req.url = pathname
        // remove trailing slash
        if (req.url.slice(-1) == '/') {
            req.url = req.url.slice(0, -1)
        }
        // get query params
        req.query = query
        // init path params
        req.params = {}

        // attach functionalities
        res.setCookie = setCookie

        try {
            let response
            let calledNext

            // before actually calling the handler, send the request to the middleware chain
            for (const middleware of this.middlewares) {
                calledNext = false

                response = await middleware.handle(req, res, () => {
                    calledNext = true
                })

                // if the middleware did not call `next()`, the chain ends and a result is
                // returned
                if (!calledNext) {
                    if (response instanceof JSONResponse) {
                        return response
                    }

                    return new JSONResponse(200, 'Success')
                }
            }

            response = await super.handle(req, res)

            // if the handler manually modified `res`, just return
            if (res.finished) {
                return
            }

            res.statusCode = response.statusCode
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(response.content))
        } catch (e) {
            console.error(`Uncaught exception in ${this.name}: ${e}`)
        }
    }

    // wrapper around the server's `listen` method
    listen(port, hostname, callback) {
        return this.server.listen(port, hostname, callback)
    }

    async __getRequestBody(req) {
        return new Promise((resolve, reject) => {
            req.body = []
            req.on('data', (chunk) => {
                req.body.push(chunk)
            })
                .on('end', () => {
                    // at this point, `req.body` has the entire request body stored in it as a string
                    const body = Buffer.concat(req.body).toString()
                    resolve(body.length > 0 ? JSON.parse(body) : '{}')
                })
                .on('error', (e) => {
                    reject(e)
                })
        })
    }
}
