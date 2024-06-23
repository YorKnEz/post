import { getElement } from '../../utils/index.js'

export class CreateAnnotation {
    constructor(id, data, main = true) {
        this.inner = document.getElementById(id)

        const children = []

        children.push([
            getElement('hr', { class: 'annotation__hr' }),
            getElement('header', { class: 'annotation__header' }, [
                getElement('span', {}, [
                    document.createTextNode('New Annotation'),
                ]),
            ]),
            getElement('textarea', {
                class: 'annotation__textarea',
                placeholder: 'Your annotation',
            }),
            getElement('footer', { class: 'annotation__footer' }, [
                getElement('div', { class: 'annotation_controls' }, [
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
        ])

        for (const child of children) {
            this.inner.appendChild(child)
        }
    }

    edit = (ev) => { }
    like = (ev) => { }
    dislike = (ev) => { }
    toggleShare = (ev) => { }

    save = (ev) => { }
    cancel = (ev) => { }
}
