import { getElement } from '../../../utils/index.js'

export class PoemCard {
    constructor(data, type, small) {
        this.inner = getElement(
            'a',
            {
                class: small
                    ? 'post-card post-card--small col-xs-2 col-sm-2 col-md-3'
                    : 'post-card col-xs-2 col-sm-8 col-md-12',
                href: `/poem/${data.id}`,
            },
            [
                getElement('section', { class: 'post-card__info' }, [
                    getElement('div', {}, [
                        getElement('span', { class: 'post-card__type' }, [
                            document.createTextNode(type),
                        ]),
                        getElement('h2', { class: 'post-card__title' }, [
                            document.createTextNode(
                                `[${data.language}] ${data.title}`
                            ),
                        ]),
                        getElement('span', { class: 'post-card__description' }, [
                            document.createTextNode(
                                data.mainAnnotation.content
                            ),
                        ]),
                    ]),
                    getElement('div', {}, [
                        getElement('span', { class: 'post-card__author' }, [
                            document.createTextNode(
                                `by ${data.author.nickname} / `
                            ),
                        ]),
                        getElement('span', { class: 'post-card__date' }, [
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
                    class: 'post-card__image',
                    src: data.cover,
                    alt: `cover of ${data.title}`,
                }),
            ]
        )
    }
}
