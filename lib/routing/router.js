import { BaseRouter, Handler, JSONResponse, Middleware } from './index.js'

// The Router is a http router which is essentially a map from (method, url) to a user specified
// handler.
//
// The router parses the given url and calls a capable handler for the given
// request. These routers allow adding middlewares to them as well, which are executed before
// actually sending the request to the afferent handler.
//
// The request handlers are added dynamically by using `router.get(url, handler)`,
// `router.post(url, handler)`, etc. The handlers are checked in order of their addition and 
// multiple handlers are allowed to the same (method, url) pair.
export default class Router extends BaseRouter {
    static methods = ['get', 'post', 'put', 'patch', 'delete']

    constructor(name = 'Router') {
        super(name)
        // a list of handlers that are called before actually passing the request to the
        // responsible handler
        this.middlewares = []
        // holds a map for each relevant http verb (get, post, put, patch, delete) from urls to
        // handlers. Where handlers are implementors of `Handle` interface or functions that have
        // a similar signature
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

                // the handler may be either a function with the signature specified by `Handler`
                // or a `Handler` implementor, which is treated differently
                if (!(handler instanceof Handler)) {
                    // illegaly instanciate a Handler object and populate it with the handler
                    // function
                    const h = new Handler()
                    h.handle = handler
                    handler = h
                }

                const router = this.router.get(method)

                if (!router.get(url)) {
                    router.set(url, [handler])
                } else {
                    router.get(url).push(handler)
                }
            }
        }
    }

    async handle(req, res) {
        // get router by method
        const router = this.router.get(req.method.toLowerCase())
        let prefix = ''

        for (const [url, handlers] of router) {
            for (const handler of handlers) {
                if (req.url.startsWith(url)) {
                    prefix = url
                } else if (url != req.url) {
                    // else try with path params
                    const params = url.match(/:\w+/g) // get path params

                    // if it has no path params, it means there is no match
                    if (params == null) {
                        continue
                    }

                    // try gathering path params

                    // build a regex that matches a prefix of this route, capturing each path param in
                    // a group
                    const pathRegex = new RegExp(
                        '^' + url.replace(/:\w+/g, '(\\w+)')
                    )
                    const values = req.url.match(pathRegex) // match the regex on the pathname

                    // if no matches are found, the url was invalid, go to the next route
                    if (values == null) {
                        continue
                    }

                    prefix = values[0]
                    // remove the first match from values, which contains the full route, leaving only
                    // the values of the params
                    values.shift()

                    // build the params object of the request my merging the params and values arrays
                    req.params = {
                        ...req.params,
                        ...params.reduce((obj, key, index) => {
                            obj[key.substring(1)] = values[index]
                            return obj
                        }, {}),
                    }

                    // else the `url == req.url` which means we can go further
                }

                // if the handler is another router, remove the prefix from the current url and pass
                // the request further down
                if (handler instanceof BaseRouter) {
                    req.url = req.url.replace(prefix, '')
                }
                // otherwise, an exact match should happen, otherwise we skip this handler
                else {
                    if (req.url != prefix) {
                        continue
                    }
                }

                try {
                    let response

                    if (this.middlewares.length > 0) {
                        // if we get here, we must first call the chain of middlewares before the
                        // handler
                        const last =
                            this.middlewares[this.middlewares.length - 1]

                        // append the handler to the chain of middlewares
                        last.next = async (req, res) =>
                            await handler.handle(req, res)

                        // call the chain
                        response = await this.middlewares[0].handle(
                            req,
                            res,
                            this.middlewares[0].next
                        )
                    } else {
                        // if we get here, no middlewares are present, so we just call the handler
                        response = await handler.handle(req, res)
                    }

                    if (response instanceof JSONResponse) {
                        // it may happen that the handler was a router which didn't find an 
                        // appropriate handler, in that case, continue with the search
                        if (response.statusCode == 404 && response.content == 'Route not found') {
                            continue
                        }

                        return response
                    }

                    // create an automatic response if handler did not give one
                    return new JSONResponse(200, 'Success')
                } catch (e) {
                    if (e instanceof JSONResponse) {
                        return e
                    }

                    console.error(`Uncaught exception in ${this.name}: ${e}`)
                    // create an automatic response if handler did not give one
                    return new JSONResponse(500, 'Internal server error')
                }
            }
        }

        // if we get here it means no route matched the given req.url
        return new JSONResponse(404, 'Route not found')
    }

    // a handler added with use, adds it to all http methods
    use(url, handler) {
        // remove trailing slash
        if (url.slice(-1) == '/') {
            url = url.slice(0, -1)
        }

        // validate that the route is of format /some/:param/thing/:param2
        if (url.match(/(\/:?\w+)*/) == null) {
            throw Error('Invalid url format')
        }

        // the handler may be either a function with the signature specified by `Handler`
        // or a `Handler` implementor, which is treated differently
        if (!(handler instanceof Handler)) {
            // illegaly instanciate a Handler object and populate it with the handler
            // function
            const h = new Handler()
            h.handle = handler
            handler = h
        }

        for (const method of Router.methods) {
            const router = this.router.get(method)

            if (!router.get(url)) {
                router.set(url, [handler])
            } else {
                router.get(url).push(handler)
            }
        }
    }

    // add a middleware to the beginning of the chain
    middleware(middleware) {
        if (!(middleware instanceof Middleware)) {
            const m = new Middleware()
            m.handle = middleware
            middleware = m
        }

        // add the middleware in the chain
        // the last middleware will forever point to nothing
        if (this.middlewares.length > 0) {
            const last = this.middlewares[this.middlewares.length - 1]

            last.next = async (req, res) =>
                await middleware.handle(req, res, middleware.next)
        }

        this.middlewares.push(middleware)
    }
}
