import { EditLyrics } from './editLyrics.js'
import { ViewLyrics } from './viewLyrics.js'

export class Lyrics {
    constructor(inner, poem, cb) {
        this.inner = inner
        poem.annotations.reverse()
        this.poem = poem
        this.cb = cb

        this.viewState = new ViewLyrics(this)
        this.editState = new EditLyrics(this)

        this.setState(this.viewState)
    }

    setState = (state) => {
        this.state?.exit()
        this.state = state
        this.state.enter()
    }
}
