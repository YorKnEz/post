import { getElement } from '../../../utils/index.js'

export class AlbumCard {
    constructor(data, hide) {
        this.inner = getElement('div', { class: 'request-card' }, [
            !hide && getElement('span', { class: 'request-card__description' }, [
                document.createTextNode(
                    `${data.poster.nickname} wants to verify`
                ),
            ]),
            getElement(
                'a',
                { class: 'request-card-post', href: `/album/${data.id}` },
                [
                    getElement('img', {
                        src: data.cover,
                        alt: `cover of ${data.title}`,
                        class: 'request-card-post__image',
                    }),
                    getElement('div', { class: 'request-card-post__info' }, [
                        getElement(
                            'span',
                            { class: 'request-card-post__title' },
                            [document.createTextNode(data.title)]
                        ),
                        getElement(
                            'span',
                            { class: 'request-card-post__author' },
                            [document.createTextNode(data.author.nickname)]
                        ),
                    ]),
                ]
            ),
        ])
    }
}
