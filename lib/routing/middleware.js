import { Handler, JSONResponse } from './index.js'

// The Middleware class, extends on the concept of Handler and defines a route that may pass it's
// request to other handlers that want to consume it or may choose to return a result and stop the
// chain.
//
// Users of this class must overwrite handle
export default class Middleware extends Handler {
    handle = (req, res, next) => {
        return new JSONResponse(200, 'Hello world')
    }
}
