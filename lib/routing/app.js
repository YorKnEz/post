import http from 'http'
import https from 'https'
import { parse } from 'node:url'

import { getCookie, setCookie } from './cookie.js'
import { Router } from './index.js'

// The App class represents the main class used for creating a server.
//
// An App extracts query and path params, request body, it attaches some special functionalities to
// the response object allows to add custom Handlers to it, which, as the name implies, handle
// requests. The handlers are called in the order of addition and the handling of the request
// stopts at the first handler that is capable of handling the request.
export default class App extends Router {
    static methodsWithBody = ['post', 'put', 'patch']

    constructor(options) {
        super()
        if (options) {
            this.https = true
            this.server = https.Server(
                options,
                async (req, res) => await this.handle(req, res)
            )
        } else {
            this.http = false
            this.server = http.Server(
                async (req, res) => await this.handle(req, res)
            )
        }
    }

    async handle(req, res) {
        // try adding body to request
        if (
            App.methodsWithBody.includes(req.method.toLowerCase()) &&
            req.headers['content-type'] == 'application/json'
        ) {
            try {
                req.body = await this.__getRequestBody(req)
            } catch (e) {
                res.setHeader('Content-Type', 'application/json')

                if (e instanceof SyntaxError) {
                    res.statusCode = 400
                    res.end(JSON.stringify({ message: 'Invalid JSON' }))
                    return
                }

                res.statusCode = 500
                res.end(JSON.stringify({ message: 'Cannot parse body' }))
            }
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
        // get cookies
        req.cookies = getCookie(req.headers.cookie ?? '')
        // locals is used for passing variables from middlewares to handlers or other middlewares
        req.locals = {}

        // attach functionalities
        res.setCookie = setCookie

        try {
            const response = await super.handle(req, res)

            // if the handler manually modified `res`, just return instead of trying to modify it
            // too
            if (res.finished) {
                return
            }

            res.statusCode = response.statusCode
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(response.content))
        } catch (e) {
            console.error(`Uncaught exception in ${this.name}: ${e}`)
            console.trace(e)
        }
    }

    // wrapper around the server's `listen` method
    listen(port, hostname, callback) {
        const protocol = this.https ? 'https' : 'http'
        console.log(`Server running at ${protocol}://${hostname}:${port}/`)

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
                    try {
                        resolve(body.length > 0 ? JSON.parse(body) : '{}')
                    } catch (e) {
                        reject(e)
                    }
                })
                .on('error', (e) => {
                    console.error(e)
                    reject(e)
                })
        })
    }
}
