import { getElement } from '../../utils/index.js'
import { UserSmallCard } from '../index.js'

export class UserRow {
    constructor(index, user) {
        this.inner = getElement(
            'a',
            {
                class: 'table__row table__row--top-contributors',
                href: `/profile/${user.id}`,
            },
            [
                getElement('div', {}, [document.createTextNode(index)]),
                new UserSmallCard(user).card,
                getElement('div', { class: 'user-row__score' }, [
                    document.createTextNode(user.contributions),
                ]),
            ]
        )
    }
}
