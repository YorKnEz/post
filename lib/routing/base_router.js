import { Handler, JSONResponse } from './index.js'

// The BaseRouter is the base class for all routers. All routers must implement a handle method
// and have a name.
export default class BaseRouter extends Handler {
    constructor(name) {
        super()
        this.name = name
    }

    async handle(req, res) {
        return new JSONResponse(200, 'Hello, World!')
    }
}
