import { getElement } from '../../utils/index.js'

export class EditAnnotation {
    constructor(id, data) {
        this.inner = document.getElementById(id)

        const children = []

        children.push([
            getElement('textarea', { class: 'annotation__textarea' }),
            getElement('footer', { class: 'annotation__edit-footer' }, [
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

                getElement('div', { class: 'annotation__buttons' }, [
                    getElement('div', {}, [
                        getElement(
                            'button',
                            { onclick: this.like, class: 'btn btn--link' },
                            [
                                getElement('i', {
                                    class: 'fa-solid fa-thumbs-up btn__icon',
                                }),
                            ]
                        ),
                        getElement('button', { class: 'btn btn--link' }, [
                            getElement('span', { class: 'btn__label' }, [
                                document.createTextNode(
                                    data.likes - data.dislikes
                                ),
                            ]),
                        ]),
                        getElement(
                            'button',
                            { onclick: this.dislike, class: 'btn btn--link' },
                            [
                                getElement('i', {
                                    class: 'fa-solid fa-thumbs-down btn__icon',
                                }),
                            ]
                        ),
                    ]),

                    getElement('div', {}, [
                        getElement(
                            'button',
                            { onclick: this.dislike, class: 'btn btn--link' },
                            [
                                getElement('i', {
                                    class: 'fa-solid fa-share btn__icon',
                                }),
                                getElement('span', { class: 'btn__label' }, [
                                    document.createTextNode('Share'),
                                ]),
                            ]
                        ),
                    ]),
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
