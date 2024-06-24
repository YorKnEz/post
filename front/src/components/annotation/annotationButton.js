import { getElement } from "../../utils/index.js"

export class AnnotationButton {
    constructor(annotate) {
        this.button = getElement(
            'button',
            { class: 'btn', style: 'position: absolute', onclick: annotate },
            [document.createTextNode('Annotate')]
        )
    }

    // align button under selection
    align = (element) => {
        const bounds = element.getBoundingClientRect()
        document.body.appendChild(this.button)
        this.button.style.top = window.scrollY + bounds.bottom + 4 + 'px'
        this.button.style.left =
            bounds.left +
            bounds.width / 2 -
            this.button.getBoundingClientRect().width / 2 +
            'px'
    }

    // hide the button from the screen
    remove = () => this.button.remove()
}
