import { getElement } from '../../utils/index.js'
import { Share } from '../share.js'

export class ViewLyrics {
    constructor(component) {
        this.component = component
    }

    enter = () => {
        this.inner = this.component.parent

        while (this.inner.firstChild) {
            this.inner.firstChild.remove()
        }

        // parse content using annotations
        this.annotations = this.component.poem.annotations

        this.content = this.component.poem.content

        for (const { id, offset, length } of this.annotations.reverse()) {
            this.content =
                this.content.substring(0, offset) +
                `<a id=annotation-${id} class="poem__annotated">${this.content.substring(offset, length)}</a>` +
                this.content.substring(offset + length)
        }

        // replace new linse with breaks
        this.content = this.content.replaceAll('\n', '<br />')

        this.inner.append(
            ...[
                getElement('div', { class: 'col-xs-4 col-sm-4 col-md-7' }, [
                    getElement(
                        'div',
                        { class: 'poem__lyrics' },
                        new DOMParser().parseFromString(
                            this.content,
                            'text/html'
                        ).body.childNodes,
                        true
                    ),
                    new Share(
                        'Share these lyrics with your friends',
                        `blablabla/poem/${this.component.poem.id}`
                    ).inner,
                ]),
            ]
        )
    }

    toggle = () => {
        this.component.setState(this.component.editState)
    }

    save = async () => { }
}
