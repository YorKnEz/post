import { getElement } from "../../../utils/index.js";

export class PoemCard {
    constructor(user, data) {
        this.inner = getElement('div', { class: 'contr-card' }, [
            getElement('span', { class: 'contr-card__description' }, [
                document.createTextNode(
                    `${user.nickname} ${data.contribution} the poem`
                ),
            ]),
            getElement('a', { class: 'contr-card-post', href: `/poems/${data.id}` }, [
                getElement('img', {
                    src: data.cover,
                    alt: `cover of ${data.title}`,
                    class: 'contr-card-post__image',
                }),
                getElement('div', { class: 'contr-card-post__info' }, [
                    getElement('span', { class: 'contr-card-post__title' }, [
                        document.createTextNode(data.title),
                    ]),
                    getElement('span', { class: 'contr-card-post__author' }, [
                        document.createTextNode(data.author.nickname),
                    ]),
                ]),
            ]),
        ])
    }
}
