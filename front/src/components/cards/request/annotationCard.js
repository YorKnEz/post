import { getElement } from '../../../utils/index.js'

export class AnnotationCard {
    constructor(data, hide) {
        this.inner = getElement('div', { class: 'request-card' }, [
            !hide
                ? getElement('a', { class: 'request-card__description' }, [
                      document.createTextNode(
                          `${data.poster.nickname} wants to verify their annotation on`
                      ),
                  ])
                : getElement('a', { class: 'request-card__description' }, [
                      document.createTextNode(
                          `${data.poster.nickname}'s annotation on`
                      ),
                  ]),
            getElement(
                'a',
                {
                    class: 'request-card-post',
                    href: `/poem/${data.poem.id}#${data.id}`,
                },
                [
                    getElement('img', {
                        src: data.poem.cover,
                        alt: `cover of ${data.poem.title}`,
                        class: 'request-card-post__image',
                    }),
                    getElement('div', { class: 'request-card-post__info' }, [
                        getElement(
                            'span',
                            { class: 'request-card-post__title' },
                            [document.createTextNode(data.poem.title)]
                        ),
                        getElement(
                            'span',
                            { class: 'request-card-post__author' },
                            [document.createTextNode(data.poem.author.nickname)]
                        ),
                    ]),
                ]
            ),
        ])
    }
}
