import { Handler } from './index.js'
import { parse } from 'node:url'

// The Router is essentially a map where keys are urls and values are handlers
//
// The Router parses the given url, extracts path and query params if necessarry and looks for a
// function that is capable of handling the said request. The request handlers are added
// dynamically by using `router.get(url, handler)`, `router.post(url, handler)`, etc.
// The handlers are checked in order of addition
export default class Router extends Handler {
    static methods = ['get', 'post', 'put', 'patch', 'delete']

    constructor(name = 'Router', prefix = '') {
        super()
        this.name = name
        this.prefix = prefix
        this.router = new Map()

        for (const method of Router.methods) {
            this.router.set(method, new Map())

            this[method] = (url, handler) => {
                // remove trailing slash
                if (url.slice(-1) == '/') {
                    url = url.slice(0, -1)
                }

                // validate that the route is of format /some/:param/thing/:param2
                if (url.match(/(\/:?\w+)*/) == null) {
                    throw Error('Invalid url format')
                }

                this.router.get(method).set(url, handler)
            }
        }
    }

    handle = async (req, res) => {
        let { pathname, query } = parse(req.url, true)
        req.query = query

        // if route doesn't begin with prefix, we can stop here
        if (!pathname.startsWith(this.prefix)) {
            return false
        }
        pathname = pathname.replace(this.prefix, '')

        // get router by method
        const router = this.router.get(req.method.toLowerCase())

        for (const route of router) {
            // try to exact match the route first
            if (route[0] != pathname) {
                // else try with path params
                const params = route[0].match(/:\w+/g) // get path params

                // if it has no path params, it means there is no match
                if (params == null) {
                    continue
                }

                // try gathering path params

                // build a regex that matches this exact route, capturing each path param in a group
                const pathRegex = new RegExp(
                    route[0].replace(/:\w+/g, '(\\w+)')
                )
                const values = pathname.match(pathRegex) // match the regex on the pathname

                // if no matches are found, the pathname was invalid, go to the next route
                if (values == null) {
                    continue
                }

                values.shift() // remove the first match from values, which contains the full route, leaving only the values of the params

                // build the params object of the request my merging the params and values arrays
                req.params = params.reduce((obj, key, index) => {
                    obj[key.substring(1)] = values[index]
                    return obj
                }, {})
            }

            try {
                await route[1](req, res)
            } catch (e) {
                console.error(`Uncaught exception in ${this.name}: ${e}`)
                res.statusCode = 500
                res.setHeader('Content-Type', 'text/plain')
                res.end('Internal server error')
            }

            return true // end matching regardless of error
        }

        // if we get here it means no route matched the given req.url
        return false
    }

    test = () => {
        console.log(this.router)
    }
}
