import { EditAnnotation } from './editAnnotation.js'
import { ViewAnnotation } from './viewAnnotation.js'

export class Annotation {
    constructor(data, poem, cancel, update) {
        this.inner = document.createTextNode('')

        this.annotation = data
        this.poem = poem
        this.cancel = cancel
        this.update = update

        this.viewState = new ViewAnnotation(this)
        this.editState = new EditAnnotation(this)

        this.setState(this.viewState)
    }

    setState = (state) => {
        this.state = state
        this.state.enter()
        if (this.update) this.update(this.inner)
    }
}
