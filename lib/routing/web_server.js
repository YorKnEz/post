import fs from 'fs'
import path from 'path'
import { BaseRouter, JSONResponse } from './index.js'

// The WebServer is capable of serving static content by using a `routes` object given by the user.
//
// The routes object is esentially a tree structure that follows the following structure:
// - '': url - serves the content at `url`
//   url
// - '*': url - whatever the path contains at this point, content at `url + path` will be served
// - '/path': url - if path matches `/path`, it serves content at `url`
// - '/path': tree - if path matches `/path`, it recursively parses `tree` until a match is found
//
// If no match is found, 404 is returned to the user
//
// The WebServer is capable of injecting environment variables into the served content by giving
// it the env vars to set.
export default class WebServer extends BaseRouter {
    static defaults = { name: 'WebServer', env: {} }

    constructor(path, routes, options) {
        options = { ...WebServer.defaults, ...options }
        super(options.name)
        // the tree structure mapping urls to files
        this.routes = routes
        // the path from where the content is taken (i.e. the base of the web server)
        this.path = path

        if (options.envLocation && Object.keys(options.env).length > 0) {
            // looks for a `path/js/env.js` file and populates it
            //
            // format of file is expected to be
            // ```
            // const env = {}
            //
            // export default env;
            // ```
            fs.writeFileSync(
                options.envLocation,
                `const env = ${JSON.stringify(options.env)}\nexport default env`
            )
        }
    }

    async handle(req, res) {
        let filePath = this.__parsePath(this.routes, req.url)

        if (filePath.length == 0) {
            // TODO: link to an error page?
            return new JSONResponse(404, 'Page not found')
        }

        filePath = path.join(this.path, filePath)
        console.log(`${req.url} -> ${filePath}`)

        try {
            let content = fs.readFileSync(filePath)
            const extension = filePath.substring(filePath.lastIndexOf('.') + 1)

            // TODO: find content type better
            switch (extension) {
                case 'css':
                    res.setHeader('Content-Type', 'text/css')
                    break
                case 'js':
                    res.setHeader('Content-Type', 'application/javascript')
                    break
                case 'json':
                    res.setHeader('Content-Type', 'application/json')
                    break
                case 'yml':
                    res.setHeader('Content-Type', 'application/x-yaml')
                    break
            }

            res.end(content)
        } catch (err) {
            console.error(err)
            return new JSONResponse(500, 'Internal server error')
        }
    }

    __parsePath(routes, path) {
        if (typeof routes == 'string') {
            return routes + path
        }

        let result

        for (const route of Object.keys(routes)) {
            // if route is *, don't consume the current path and go further
            if (route == '\\*') {
                result = this.__parsePath(routes[route], path)
            } else {
                let regex

                if (typeof routes[route] == 'string') {
                    regex = new RegExp('^' + route + '$')
                } else {
                    regex = new RegExp('^' + route)
                }

                const match = path.match(regex)

                if (match == null) {
                    continue
                }

                result = this.__parsePath(
                    routes[route],
                    path.replace(regex, '')
                )
            }

            // found
            if (result.length > 0) {
                return result
            }
        }

        // not found
        return ''
    }
}
