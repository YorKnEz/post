import { getElement } from '../../../utils/index.js'

export class AnnotationCard {
    constructor(user, data) {
        this.inner = getElement('div', { class: 'contr-card' }, [
            getElement('a', { class: 'contr-card__description' }, [
                document.createTextNode(
                    `${user.nickname} ${data.contribution} an annotation on`
                ),
            ]),
            getElement(
                'a',
                { class: 'contr-card-post', href: `/poem/${data.poem.id}#${data.id}` },
                [
                    getElement('img', {
                        src: data.poem.cover,
                        alt: `cover of ${data.poem.title}`,
                        class: 'contr-card-post__image',
                    }),
                    getElement('div', { class: 'contr-card-post__info' }, [
                        getElement(
                            'span',
                            { class: 'contr-card-post__title' },
                            [document.createTextNode(data.poem.title)]
                        ),
                        getElement(
                            'span',
                            { class: 'contr-card-post__author' },
                            [document.createTextNode(data.poem.author.nickname)]
                        ),
                    ]),
                ]
            ),
        ])
    }
}
