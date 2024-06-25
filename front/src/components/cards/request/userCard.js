import { getElement } from '../../../utils/index.js'

export class UserCard {
    constructor(data, hide) {
        this.inner = getElement('div', { class: 'request-card' }, [
            !hide &&
                getElement('span', { class: 'request-card__description' }, [
                    document.createTextNode(
                        `${data.nickname} wants to become a poet`
                    ),
                ]),
            getElement(
                'a',
                { class: 'request-card-post', href: `/profile/${data.id}` },
                [
                    getElement('img', {
                        src: data.avatar,
                        alt: `cover of ${data.nickname}`,
                        class: 'request-card-post__image',
                    }),
                    getElement('div', { class: 'request-card-post__info' }, [
                        getElement(
                            'span',
                            { class: 'request-card-post__title' },
                            [document.createTextNode(data.nickname)]
                        ),
                        getElement(
                            'span',
                            { class: 'request-card-post__author' },
                            [
                                document.createTextNode(
                                    data.firstName + ' ' + data.lastName
                                ),
                            ]
                        ),
                    ]),
                ]
            ),
        ])
    }
}
