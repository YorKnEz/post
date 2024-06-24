import { updateAnnotation } from '../../../services/index.js'
import { getElement } from '../../../utils/index.js'

export class EditAnnotation {
    constructor(component) {
        this.component = component
    }

    enter = () => {
        this.textarea = getElement(
            'textarea',
            {
                class: 'annotation__textarea',
            },
            [document.createTextNode(this.component.annotation.content)]
        )

        if (this.component.cancel == undefined) {
            this.inner = getElement(
                'section',
                {
                    class: 'col-xs-4 col-sm-4 col-md-7 annotation',
                },
                [
                    getElement('h2', { class: 'annotation__title' }, [
                        document.createTextNode('About'),
                    ]),
                ]
            )
        } else {
            this.inner = getElement(
                'aside',
                {
                    class: 'col-xs-4 col-sm-4 col-md-5 annotation annotation--floating',
                },
                [
                    getElement('div', { class: ' annotation__top-controls' }, [
                        getElement(
                            'button',
                            {
                                class: 'btn btn--link',
                                onclick: this.component.cancel,
                            },
                            [
                                getElement('i', {
                                    class: 'fa-solid fa-close btn__icon',
                                }),
                            ]
                        ),
                    ]),
                    getElement('hr', { class: 'annotation__hr' }),
                ]
            )
        }

        this.inner.append(
            ...[
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
    }

    save = async (ev) => {
        try {
            this.component.annotation = {
                ...this.component.annotation,
                ...(await updateAnnotation(
                    this.component.annotation.id,
                    this.textarea.value
                )),
            }

            this.component.setState(this.component.viewState)
        } catch (e) {
            console.error(e)
            // TODO: handle
        }
    }

    cancel = (ev) => {
        this.component.setState(this.component.viewState)
    }
}
