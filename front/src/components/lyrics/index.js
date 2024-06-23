import { EditLyrics } from './editLyrics.js'
import { ViewLyrics } from './viewLyrics.js'

export class Lyrics {
    constructor(parent, poem, cb) {
        this.parent = parent
        this.poem = poem
        this.cb = cb

        console.log(poem)

        this.viewState = new ViewLyrics(this)
        this.editState = new EditLyrics(this)

        this.setState(this.viewState)
    }

    setState = (state) => {
        this.state = state
        this.state.enter()
    }
}
