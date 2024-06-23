import { getElement } from '../../utils/index.js'

export class Annotation {
    constructor(data, main = true) {
        if (main) {
            this.inner = getElement('section', {
                class: 'col-xs-4 col-sm-4 col-md-7 annotation',
            })

            this.inner.appendChild(
                getElement('h2', { class: 'annotation__title' }, [
                    document.createTextNode('About'),
                ])
            )
        } else {
            this.inner = getElement('aside', {
                class: 'col-xs-4 col-sm-4 col-md-5 annotation annotation--floating',
            })

            this.inner.appendChild(
                getElement('div', { class: ' annotation__top-controls' }, [
                    getElement(
                        'button',
                        { class: 'btn btn--link', onclick: this.cancel },
                        [
                            getElement('i', {
                                class: 'fa-solid fa-close btn__icon',
                            }),
                        ]
                    ),
                ]),
                getElement('hr', { class: 'annotation__hr' })
            )
        }

        this.inner.append(
            ...[
                getElement('header', { class: 'annotation__header' }, [
                    getElement('span', {}, [
                        document.createTextNode('Annotation'),
                    ]),
                    getElement('button', { class: 'btn btn--link' }, [
                        getElement('span', { class: 'btn__label' }, [
                            document.createTextNode(
                                `${data.contributors} contributors`
                            ),
                        ]),
                    ]),
                ]),
                getElement('div', { class: 'annotation__text' }, [
                    document.createTextNode(data.content),
                ]),
                getElement('footer', { class: 'annotation__footer' }, [
                    getElement('div', { class: 'annotation__controls' }, [
                        getElement(
                            'button',
                            {
                                onclick: this.edit,
                                class: 'btn btn--round btn--transparent',
                            },
                            [
                                getElement('span', { class: 'btn__label' }, [
                                    document.createTextNode('Edit'),
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
                                {
                                    onclick: this.dislike,
                                    class: 'btn btn--link',
                                },
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
                                {
                                    onclick: this.dislike,
                                    class: 'btn btn--link',
                                },
                                [
                                    getElement('i', {
                                        class: 'fa-solid fa-share btn__icon',
                                    }),
                                    getElement(
                                        'span',
                                        { class: 'btn__label' },
                                        [document.createTextNode('Share')]
                                    ),
                                ]
                            ),
                        ]),
                    ]),
                ]),
            ]
        )

        // for (const child of children) {
        //     this.inner.appendChild(child)
        // }
    }

    edit = (ev) => { }
    like = (ev) => { }
    dislike = (ev) => { }
    toggleShare = (ev) => { }

    save = (ev) => { }
    cancel = (ev) => { }
}
