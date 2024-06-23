import { getElement } from '../../utils/index.js'

export class PoemCard {
    constructor(data, type, small) {
        this.inner = getElement(
            'a',
            {
                class: small
                    ? 'card card--small col-xs-2 col-sm-2 col-md-3'
                    : 'card col-xs-2 col-sm-8 col-md-12',
                href: `/poem/${data.id}`,
            },
            [
                getElement('section', { class: 'card__info' }, [
                    getElement('div', {}, [
                        getElement('span', { class: 'card__type' }, [
                            document.createTextNode(type),
                        ]),
                        getElement('h2', { class: 'card__title' }, [
                            document.createTextNode(
                                `[${data.language}] ${data.title}`
                            ),
                        ]),
                        getElement('span', { class: 'card__description' }, [
                            document.createTextNode(
                                data.mainAnnotation.content
                            ),
                        ]),
                    ]),
                    getElement('div', {}, [
                        getElement('span', { class: 'card__author' }, [
                            document.createTextNode(
                                `by ${data.author.nickname} / `
                            ),
                        ]),
                        getElement('span', { class: 'card__date' }, [
                            document.createTextNode(
                                new Date(data.createdAt).toLocaleDateString(
                                    'en-US',
                                    {
                                        year: 'numeric',
                                        month: 'short',
                                        day: '2-digit',
                                    }
                                )
                            ),
                        ]),
                    ]),
                ]),
                getElement('img', {
                    class: 'card__image',
                    src: data.cover,
                    alt: `cover of ${data.title}`,
                }),
            ]
        )
    }
}
