import { getElement } from '../../utils/index.js'

export class EmptyAnnotation {
    constructor(component) {
        this.component = component
    }

    enter = () => {
        this.inner = getElement('div', { class: 'col-xs-4 col-sm-4 col-md-5' })

        this.component.inner.replaceWith(this.inner)
        this.component.inner = this.inner

        window.addEventListener('annotation', this.onclick)
    }

    exit = () => {
        window.removeEventListener('annotation', this.onclick)
    }

    onclick = async ({ annotation }) => {
        this.component.annotation = annotation
        this.component.setState(this.component.viewState)
    }
}
