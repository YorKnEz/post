import { logout } from '../services/index.js'
import { getElement, getErrorMessage, toggleTheme } from '../utils/index.js'
import { Search, UserSmallCard } from './index.js'

export class Sidebar {
    constructor() {
        let user = localStorage.getItem('user')

        if (user) {
            user = JSON.parse(user)
        }

        this.search = new Search('search', 'sidebar')

        this.inner = getElement('nav', { id: 'sideabar', class: 'sidebar' }, [
            this.search.inner,
            !user &&
            getElement('a', { class: 'sidebar__item', href: '/login' }, [
                getElement('i', {
                    class: 'fa-solid fa-right-to-bracket sidebar__icon',
                }),
                getElement('span', {}, [document.createTextNode('Log in')]),
            ]),
            !user &&
            getElement('a', { class: 'sidebar__item', href: '/register' }, [
                getElement('i', {
                    class: 'fa-solid fa-user-plus sidebar__icon',
                }),
                getElement('span', {}, [
                    document.createTextNode('Register'),
                ]),
            ]),
            user &&
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
            user &&
            getElement(
                'button',
                {
                    class: 'sidebar__item sidebar__item--button',
                    onclick: this.__handleLogout,
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

        if (user) {
            this.__setUser(user)
        }
    }

    __setUser = (user) => {
        this.inner.insertBefore(
            getElement('a', { href: '/profile', class: 'sidebar__profile' }, [
                new UserSmallCard(user).card,
            ]),
            this.inner.firstChild
        )
    }

    __handleLogout = async () => {
        try {
            await logout()

            localStorage.removeItem('user')

            // navigate to home after being logged out
            location.assign('/')
        } catch (e) {
            console.error(getErrorMessage(e))
        }
    }
}
