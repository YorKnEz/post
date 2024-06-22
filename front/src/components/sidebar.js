import { getElement, toggleTheme } from '../utils/index.js'
import { Search, UserSmallCard } from './index.js'

export class Sidebar {
    constructor() {
        this.search = new Search('search', 'sidebar')

        this.inner = getElement('nav', { id: 'sideabar', class: 'sidebar' }, [
            this.search.inner,
            getElement('a', { class: 'sidebar__item', href: '/login' }, [
                getElement('i', {
                    class: 'fa-solid fa-right-to-bracket sidebar__icon',
                }),
                getElement('span', {}, [document.createTextNode('Log in')]),
            ]),
            getElement('a', { class: 'sidebar__item', href: '/register' }, [
                getElement('i', {
                    class: 'fa-solid fa-user-plus sidebar__icon',
                }),
                getElement('span', {}, [document.createTextNode('Register')]),
            ]),
            getElement(
                'a',
                {
                    class: 'sidebar__item sidebar__item--nav',
                    href: '/add-poem',
                },
                [
                    getElement('i', {
                        class: 'fa-solid fa-plus sidebar__icon',
                    }),
                    getElement('span', {}, [
                        document.createTextNode('Add Poem'),
                    ]),
                ]
            ),
            getElement(
                'a',
                { class: 'sidebar__item sidebar__item--nav', href: '/rss' },
                [
                    getElement('i', {
                        class: 'fa-solid fa-rss sidebar__icon',
                    }),
                    getElement('span', {}, [document.createTextNode('RSS')]),
                ]
            ),
            getElement('div', { class: 'sidebar__separator' }),
            getElement(
                'button',
                {
                    class: 'sidebar__item sidebar__item--button',
                    // onclick: TODO,
                },
                [
                    getElement('i', {
                        class: 'fa-solid fa-right-from-bracket sidebar__icon',
                    }),
                    getElement('span', {}, [
                        document.createTextNode('Log out'),
                    ]),
                ]
            ),
            getElement(
                'button',
                {
                    class: 'sidebar__item sidebar__item--button sidebar__item--nav',
                    onclick: toggleTheme,
                },
                [
                    getElement('i', {
                        class: 'fa-solid fa-sun sidebar__icon',
                    }),
                    getElement('span', {}, [
                        document.createTextNode('Toggle Theme'),
                    ]),
                ]
            ),
        ])

        const user = localStorage.getItem('user')

        if (user) {
            this.inner.insertBefore(
                new UserSmallCard(user),
                this.inner.firstChild
            )
        }
    }
}
