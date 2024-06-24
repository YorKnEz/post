import { getElement } from '../../utils/index.js'

export class PostRow {
    constructor(index, post, type) {
        if (!type) {
            type = post.type
        }

        this.inner = getElement(
            'a',
            {
                class: 'table__row table__row--poem-chart',
                href: `/${type}/${post.id}`,
            },
            [
                getElement('div', {}, [document.createTextNode(index)]),
                getElement('div', { class: 'post-row' }, [
                    getElement('img', {
                        class: 'post-row__image',
                        src: post.cover,
                        alt: `cover of ${post.title}`,
                    }),
                    getElement('div', { class: 'post-row__info' }, [
                        getElement('span', { class: 'post-row__text' }, [
                            document.createTextNode(post.title),
                        ]),
                    ]),
                ]),
                getElement('div', { class: 'post-row__text' }, [
                    document.createTextNode(post.likes),
                ]),
                getElement('div', { class: 'post-row__text' }, [
                    document.createTextNode(post.contributors),
                ]),
            ]
        )
    }
}
