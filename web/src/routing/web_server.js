import fs from 'fs'
import path from 'path'
import { Handler } from './index.js'

// The WebServer is capable of serving static content by using a `routes` object given by the user
//
// The routes object is esentially a tree structure that follows the following structure:
// - '': url - serves the content at `url`
//   url
// - '*': url - whatever the path contains at this point, content at `url + path` will be served
// - '/path': url - if path matches `/path`, it serves content at `url`
// - '/path': tree - if path matches `/path`, it recursively parses `tree` until a match is found
// If no match is found, 404 is returned to the user
export default class WebServer extends Handler {
    constructor(path, routes, name = 'WebServer', prefix = '') {
        super()
        this.routes = routes
        this.path = path
        this.name = name
    }

    handle = async (req, res) => {
        let filePath = this.parsePath(this.routes, req.url)
        req.url = req.url.replace(this.prefix, '')

        if (filePath.length == 0) {
            return false
        }

        filePath = path.join(this.path, filePath)
        console.log(`${req.url} -> ${filePath}`)

        try {
            const content = fs.readFileSync(filePath)

            // TODO: find content type
            // switch (extension) {
            //     case 'css':
            //         res.setHeader('Content-Type', 'text/css')
            //         break
            //     case 'js':
            //         res.setHeader('Content-Type', 'application/javascript')
            //         break
            //     case 'json':
            //         res.setHeader('Content-Type', 'application/json')
            //         break
            //     case 'yml':
            //         res.setHeader('Content-Type', 'application/x-yaml')
            //         break
            // }

            res.end(content)
        } catch (err) {
            console.log(err)
            res.writeHead(500, { 'Content-Type': 'text/plain' })
            res.end('Internal Server Error')
        }

        return true
    }

    parsePath = (routes, path) => {
        if (typeof routes == 'string') {
            return routes + path
        }

        for (const k in routes) {
            if (k == '') {
                if (path != k) {
                    continue
                }
                return this.parsePath(routes[k], path)
            } else if (path.startsWith(k)) {
                if (typeof routes[k] == 'string' && !path.endsWith(k)) {
                    continue
                }
                return this.parsePath(routes[k], path.replace(k, ''))
            } else if (k == '*') {
                return this.parsePath(routes[k], path)
            }
        }

        return ''
    }
}
