import { JSONResponse } from './index.js'

// Handler class is the interface for all routers
//
// Users of this class must overwrite handle
export default class Handler {
    // handle takes as input the request and response objects and returns a `JSONResponse`
    async handle(req, res) {
        return new JSONResponse(200, 'Hello world')
    }
}
