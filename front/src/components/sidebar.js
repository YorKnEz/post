import env from '../env.js'
import { logout } from '../services/index.js'
import {
    getElement,
    getErrorMessage,
    isAdmin,
    toggleTheme,
} from '../utils/index.js'
import { Search, UserSmallCard } from './index.js'

export class Sidebar {
    constructor(user) {
        if (user) {
            user = JSON.parse(user)
        }

        this.search = new Search('search', 'sidebar')

        this.inner = getElement('nav', { id: 'sideabar', class: 'sidebar' }, [
            this.search.inner,
            ...(!user
                ? [
                      getElement(
                          'a',
                          { class: 'sidebar__item', href: '/login' },
                          [
                              getElement('i', {
                                  class: 'fa-solid fa-right-to-bracket sidebar__icon',
                              }),
                              getElement('span', {}, [
                                  document.createTextNode('Log in'),
                              ]),
                          ]
                      ),
                      getElement(
                          'a',
                          { class: 'sidebar__item', href: '/register' },
                          [
                              getElement('i', {
                                  class: 'fa-solid fa-user-plus sidebar__icon',
                              }),
                              getElement('span', {}, [
                                  document.createTextNode('Register'),
                              ]),
                          ]
                      ),
                  ]
                : [
                      isAdmin(user.roles) &&
                          getElement(
                              'a',
                              {
                                  class: 'sidebar__item',
                                  href: '/dashboard',
                              },
                              [
                                  getElement('i', {
                                      class: 'fa-solid fa-dashboard sidebar__icon',
                                  }),
                                  getElement('span', {}, [
                                      document.createTextNode('Dashboard'),
                                  ]),
                              ]
                          ),
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
                          { class: 'sidebar__item', href: '/add-album' },
                          [
                              getElement('i', {
                                  class: 'fa-solid fa-plus sidebar__icon',
                              }),
                              getElement('span', {}, [
                                  document.createTextNode('Add Album'),
                              ]),
                          ]
                      ),
                  ]),
            getElement(
                'a',
                {
                    class: 'sidebar__item sidebar__item--nav',
                    href: `${env.LYRICAL_SERVICE_API_URL}/posts/rss.xml`,
                    target: '_blank',
                },
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

            sessionStorage.removeItem('user')

            // navigate to home after being logged out
            location.assign('/')
        } catch (e) {
            console.error(getErrorMessage(e))
        }
    }
}
