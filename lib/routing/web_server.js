import fs from 'fs'
import path from 'path'
import { BaseRouter } from './index.js'

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

        if (Object.keys(options.env).length > 0) {
            // looks for a `path/js/env.js` file and populates it
            //
            // format of file is expected to be
            // ```
            // const env = {}
            //
            // export default env;
            // ```
            fs.writeFileSync(
                this.path + '/js/env.js',
                `const env = ${JSON.stringify(options.env)}\nexport default env`
            )
        }
    }

    async handle(req, res) {
        let filePath = this.__parsePath(this.routes, req.url)

        if (filePath.length == 0) {
            return false
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
            res.writeHead(500, { 'Content-Type': 'text/plain' })
            res.end('Internal Server Error')
        }

        return true
    }

    __parsePath(routes, path) {
        if (typeof routes == 'string') {
            return routes + path
        }

        for (const k in routes) {
            if (k == '') {
                if (path != k) {
                    continue
                }
                return this.__parsePath(routes[k], path)
            } else if (path.startsWith(k)) {
                if (typeof routes[k] == 'string' && !path.endsWith(k)) {
                    continue
                }
                return this.__parsePath(routes[k], path.replace(k, ''))
            } else if (k == '*') {
                return this.__parsePath(routes[k], path)
            }
        }

        return ''
    }
}
