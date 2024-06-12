// Handler class is the blueprint for the Router and WebServer classes
//
// Users of this class must overwrite handle
export default class Handler {
    handle = async (req, res) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain')
        res.end('Hello World')
    }
}
