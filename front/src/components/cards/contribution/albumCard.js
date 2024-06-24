import { getElement } from '../../../utils/index.js'

export class AlbumCard {
    constructor(user, data) {
        this.inner = getElement('div', { class: 'contr-card' }, [
            getElement('span', { class: 'contr-card__description' }, [
                document.createTextNode(
                    `${user.nickname} ${data.contribution} the album`
                ),
            ]),
            getElement('a', { class: 'contr-card-post', href: `/album/${data.id}` }, [
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
