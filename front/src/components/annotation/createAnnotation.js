import { addPoemAnnotation } from '../../services/lyrical.js'
import { getElement } from '../../utils/index.js'
import { AnnotationClickEvent } from '../events/annotationClickEvent.js'

export class CreateAnnotation {
    constructor(component) {
        this.component = component
    }

    enter = () => {
        this.textarea = getElement('textarea', {
            class: 'annotation__textarea',
            placeholder: 'Your annotation',
        })

        this.inner = getElement(
            'aside',
            {
                class: 'col-xs-4 col-sm-4 col-md-5 annotation annotation--floating',
            },
            [
                getElement('hr', { class: 'annotation__hr' }),
                getElement('header', { class: 'annotation__header' }, [
                    getElement('span', {}, [
                        document.createTextNode('New Annotation'),
                    ]),
                ]),
                this.textarea,
                getElement('footer', { class: 'annotation__footer' }, [
                    getElement('div', { class: 'annotation__controls' }, [
                        getElement(
                            'button',
                            {
                                onclick: this.save,
                                class: 'btn btn--round btn--transparent',
                            },
                            [
                                getElement('span', { class: 'btn__label' }, [
                                    document.createTextNode('Save'),
                                ]),
                            ]
                        ),
                        getElement(
                            'button',
                            {
                                onclick: this.cancel,
                                class: 'btn btn--round btn--transparent',
                            },
                            [
                                getElement('span', { class: 'btn__label' }, [
                                    document.createTextNode('Cancel'),
                                ]),
                            ]
                        ),
                    ]),
                ]),
            ]
        )

        this.component.inner.replaceWith(this.inner)
        this.component.inner = this.inner

        this.component.align(this.component.region)
    }

    exit = () => { }

    save = async (ev) => {
        let html = this.component.lyrics.innerHTML
        let offset = 0

        while (
            !html.startsWith(
                '<a class="poem__annotated poem__annotated--active">'
            )
        ) {
            console.log(html.substring(0, 16))
            if (
                html.startsWith('<a id="annotation-') ||
                html.startsWith('</a>')
            ) {
                html = html.replace(/<.*?>/, '')
            } else if (html.startsWith('<br>')) {
                html = html.replace('<br>', '')
                offset += 1
            } else {
                html = html.slice(1)
                offset += 1
            }
        }

        const content = this.component.region.innerHTML.replace('<br>', '\n')
        const length = content.length

        // get poem id from url
        const poemId = parseInt(location.pathname.replace('/poem', '').slice(1))

        // create annotation
        const { id } = await addPoemAnnotation(poemId, {
            content: this.textarea.value,
            offset,
            length,
        })

        // turn the region into a real annotation
        this.component.region.setAttribute('id', `annotation-${id}`)
        this.component.region.classList.toggle('poem__annotated--active')

        this.component.annotation = { id, element: this.component.region }

        this.component.region.addEventListener('click', () => {
            window.dispatchEvent(
                new AnnotationClickEvent(this.component.annotation)
            )
        })

        this.component.setState(this.component.viewState)
    }

    cancel = (ev) => {
        this.component.region.replaceWith(...this.component.region.childNodes)
        this.component.setState(this.component.emptyState)
    }

}
