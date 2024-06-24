import { updatePoem } from '../../services/lyrical.js'
import { autoGrow, getElement } from '../../utils/index.js'

export class EditLyrics {
    constructor(component) {
        this.component = component
    }

    enter = () => {
        this.inner = this.component.inner

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

        this.inner.append(
            ...[
                this.textarea,
                getElement('aside', { class: 'col-xs-4 col-sm-4 col-md-5' }, [
                    getElement('button', { class: 'btn', onclick: this.save }, [
                        document.createTextNode('Save'),
                    ]),
                    getElement(
                        'button',
                        { class: 'btn', onclick: this.toggle },
                        [document.createTextNode('Cancel')]
                    ),
                ]),
            ]
        )

        this.component.inner.replaceWith(this.inner)
        this.component.inner = this.inner
    }

    exit = () => {}

    toggle = () => {
        this.component.cb()
        this.component.setState(this.component.viewState)
    }

    save = async (ev) => {
        this.component.poem = await updatePoem(this.component.poem.id, {
            content: this.textarea.value,
        })

        // refresh page on update
        location.reload()
    }
}
