import { getElement, getUserRole } from '../../utils/index.js'

export class UserSmallCard {
    constructor(user) {
        this.card = getElement('div', { class: 'user-small-card' }, [
            getElement('img', {
                class: 'user-small-card__image',
                src: user.avatar,
                alt: `avatar of ${user.nickname}`,
            }),
            getElement('div', { class: 'user-small-card__info' }, [
                getElement('span', { class: 'user-small-card__name' }, [
                    document.createTextNode(user.nickname),
                ]),
                getElement('span', { class: 'user-small-card__role' }, [
                    document.createTextNode(getUserRole(user.roles)),
                ]),
            ]),
        ])
    }
}
