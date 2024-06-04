import { Server } from 'http'

// The App class represents the main class used for creating a server
// 
// An App allows to add custom Handlers to it, which, as the name implies, handle requests
// The handlers are called in the order of addition and the handling of the request stopts at the // first handler that is capable of handling the request
export default class App extends Server {
    constructor(prefix = '') {
        super(async (req, res) => {
            for (const { name, prefix, handler } of this.handlers) {
                req.url = req.url.replace(this.prefix, '')
                const matched = await handler.handle(req, res)
                if (matched) {
                    return
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

    add = (handler, name = '', prefix = '') => {
        this.handlers.push({ name, prefix, handler })
    }
}
