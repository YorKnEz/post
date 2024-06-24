import { addReaction } from '../../../services/index.js'
import { getElement } from '../../../utils/index.js'
import { Share } from '../../share.js'

export class ViewAnnotation {
    constructor(component) {
        this.component = component
    }

    enter = () => {
        this.poem = this.component.poem
        this.annotation = this.component.annotation

        let url

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

            url = location.origin + location.pathname + '#about'
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

            url = location.origin + location.pathname + '#' + this.annotation.id
        }

        this.share = new Share('Share this annotation', {
            title: `Check out this annotation of ${this.poem.title}`,
            content: `This annotation has been made by ${this.poem.author.nickname}:\n${this.annotation.content}`,
            url,
        })

        this.share.toggle()

        this.inner.append(
            ...[
                getElement('header', { class: 'annotation__header' }, [
                    getElement('span', {}, [
                        document.createTextNode('Annotation'),
                    ]),
                    getElement('button', { class: 'btn btn--link' }, [
                        getElement('span', { class: 'btn__label' }, [
                            document.createTextNode(
                                `${this.annotation.contributors} contributors`
                            ),
                        ]),
                    ]),
                ]),
                getElement('div', { class: 'annotation__text' }, [
                    document.createTextNode(this.annotation.content),
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
                        getElement('div', { class: 'annotation__reactions' }, [
                            getElement(
                                'button',
                                { onclick: this.like, class: 'btn btn--link' },
                                [
                                    getElement('i', {
                                        class: `fa-${this.annotation.liked ? 'solid' : 'regular'} fa-thumbs-up btn__icon`,
                                    }),
                                ]
                            ),
                            getElement('button', { class: 'btn btn--link' }, [
                                getElement('span', { class: 'btn__label' }, [
                                    document.createTextNode(
                                        this.annotation.likes -
                                        this.annotation.dislikes
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
                                        class: `fa-${this.annotation.disliked ? 'solid' : 'regular'} fa-thumbs-down btn__icon`,
                                    }),
                                ]
                            ),
                        ]),
                        getElement('div', {}, [
                            getElement(
                                'button',
                                {
                                    onclick: this.share.toggle,
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
                this.share.inner,
            ]
        )

        this.component.inner.replaceWith(this.inner)
        this.component.inner = this.inner
    }

    edit = (ev) => {
        this.component.setState(this.component.editState)
    }

    like = async (ev) => {
        try {
            await addReaction(this.annotation.id, {
                action: this.annotation.liked ? -1 : 1,
                type: 0,
            })

            this.annotation.liked = !this.annotation.liked

            if (this.annotation.liked) {
                if (this.annotation.disliked) {
                    this.annotation.dislikes -= 1
                    this.annotation.disliked = false
                }

                this.annotation.likes += 1
            } else {
                this.annotation.likes -= 1
            }

            this.component.setState(this.component.viewState)
        } catch (e) {
            console.error(e)
        }
    }

    dislike = async (ev) => {
        try {
            await addReaction(this.annotation.id, {
                action: this.annotation.disliked ? -1 : 1,
                type: 1,
            })

            this.annotation.disliked = !this.annotation.disliked

            if (this.annotation.disliked) {
                if (this.annotation.liked) {
                    this.annotation.likes -= 1
                    this.annotation.liked = false
                }

                this.annotation.dislikes += 1
            } else {
                this.annotation.dislikes -= 1
            }

            this.component.setState(this.component.viewState)
        } catch (e) {
            console.error(e)
        }
    }
}
