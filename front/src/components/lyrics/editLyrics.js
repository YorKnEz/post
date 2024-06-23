import { updatePoem } from '../../services/lyrical.js'
import { autoGrow, getElement, htmlToText } from '../../utils/index.js'

export class EditLyrics {
    constructor(component) {
        this.component = component
    }

    enter = () => {
        this.inner = this.component.parent

        while (this.inner.firstChild) {
            this.inner.firstChild.remove()
        }

        this.textarea = getElement(
            'textarea',
            { class: 'col-xs-4 col-sm-4 col-md-7 poem__textarea' },
            [document.createTextNode(this.component.poem.content)]
        )
        autoGrow(this.textarea)
        this.textarea.addEventListener('keyup', () => autoGrow(this.textarea))

        this.inner.appendChild(this.textarea)
        this.inner.appendChild(
            getElement('aside', { class: 'col-xs-4 col-sm-4 col-md-5' }, [
                getElement(
                    'button',
                    { class: 'btn', onclick: this.component.state.save },
                    [document.createTextNode('Save')]
                ),
                getElement(
                    'button',
                    { class: 'btn', onclick: this.component.state.toggle },
                    [document.createTextNode('Cancel')]
                ),
            ])
        )
    }

    toggle = () => {
        this.component.setState(this.component.viewState)
    }

    save = async (ev) => {
        this.component.poem = await updatePoem(this.component.poem.id, {
            content: this.textarea.value,
        })

        this.toggle(ev)
    }
}
