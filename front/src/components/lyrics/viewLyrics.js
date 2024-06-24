import { getElement } from '../../utils/index.js'
import { AnnotationsHandler } from '../annotation/index.js'
import { Share } from '../share.js'

export class ViewLyrics {
    constructor(component) {
        this.component = component
    }

    enter = () => {
        this.inner = this.component.inner

        while (this.inner.firstChild) {
            this.inner.firstChild.remove()
        }

        // parse content using annotations
        this.content = this.component.poem.content

        for (const { id, offset, length } of this.component.poem.annotations) {
            const before = this.content.substring(0, offset)
            const after = this.content.substring(offset + length)

            this.content =
                before +
                `<a id=annotation-${id} class="poem__annotated">${this.content.substring(offset, offset + length)}</a>` +
                after
        }

        // replace new linse with breaks
        this.content = this.content.replaceAll('\n', '<br>')

        const lyrics = getElement('div', { class: 'poem__lyrics' })

        const htmlContent = new DOMParser().parseFromString(
            this.content,
            'text/html'
        )

        for (const child of htmlContent.body.childNodes) {
            lyrics.append(child.cloneNode(true))
        }

        this.annotationsHandler = new AnnotationsHandler(
            lyrics,
            this.component.poem
        )

        this.inner.append(
            ...[
                getElement('div', { class: 'col-xs-4 col-sm-4 col-md-7' }, [
                    lyrics,
                    new Share('Share these lyrics with your friends', {
                        title: `Check out the lyrics of ${this.component.poem.title} by ${this.component.poem.author.nickname}`,
                        content: `More about these lyrics: ${this.component.poem.mainAnnotation.content.substring(0, 100)}...`,
                        url: location.href,
                    }).inner,
                ]),
                this.annotationsHandler.inner,
            ]
        )

        this.component.inner.replaceWith(this.inner)
        this.component.inner = this.inner
    }

    exit = () => {
        this.annotationsHandler.exit()
    }

    toggle = () => {
        this.component.cb()
        this.component.setState(this.component.editState)
    }
}
