import {
    Navbar,
    Dropdown,
    Loader,
    ContributionCard,
} from '../../components/index.js'
import { getContributions } from '../../services/lyrical.js'
import { getUser } from '../../services/users.js'
import { getElement } from '../../utils/html.js'
import { getUserRole } from '../../utils/index.js'

window.navbar = new Navbar()

const profileLoader = new Loader('profile')

const loadProfile = async (user) => {
    const content = profileLoader.getContent()

    content.append(
        ...[
            getElement('img', {
                class: 'profile__avatar col-xs-4 col-sm-4 col-md-5',
                src: user.avatar,
            }),
            getElement(
                'div',
                { class: 'profile__container col-xs-4 col-sm-4 col-md-7' },
                [
                    getElement('div', { class: 'profile__info' }, [
                        getElement('h1', { class: 'profile__name' }, [
                            document.createTextNode(
                                `${user.firstName} ${user.lastName} (AKA ${user.nickname})`
                            ),
                        ]),
                        getElement('h3', { class: 'profile__role' }, [
                            document.createTextNode(getUserRole(user.role)),
                        ]),
                        getElement('span', { class: 'profile__joined' }, [
                            document.createTextNode(
                                `Joined on ${new Date(
                                    user.createdAt
                                ).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: '2-digit',
                                })}`
                            ),
                        ]),
                    ]),
                    getElement('button', { class: 'btn profile__editor-btn' }, [
                        getElement('span', { class: 'btn__label' }, [
                            document.createTextNode('Become a Poet'),
                        ]),
                    ]),
                ]
            ),
        ]
    )

    profileLoader.loaded()
}

const topAccomplishmentsLoader = new Loader('top-accomplishments')

const loadTopAccomplishments = async (user) => {
    const content = topAccomplishmentsLoader.getContent()

    topAccomplishmentsLoader.loaded()
}

const statisticsLoader = new Loader('statistics')

const loadStatistics = async (user) => {
    const content = statisticsLoader.getContent()

    const stats = [
        {
            stat: user.albumsCount,
            icon: 'fa-solid fa-quote-left',
            title: 'Albums',
        },
        {
            stat: user.createdPoemsCount,
            icon: 'fa-solid fa-quote-left',
            title: 'Poems',
        },
        {
            stat: user.translatedPoemsCount,
            icon: 'fa-solid fa-quote-left',
            title: 'Translations',
        },
        {
            stat: user.annotationsCount,
            icon: 'fa-solid fa-quote-left',
            title: 'Annotations',
        },
        {
            stat:
                user.albumsContributions +
                user.poemsContributions +
                user.annotationsContributions,
            icon: 'fa-solid fa-quote-left',
            title: 'Contributions',
        },
    ]

    for (const { stat, icon, title } of stats) {
        content.appendChild(
            getElement('div', { class: 'statistics__item', title: stat }, [
                getElement('div', { class: 'statistics__info' }, [
                    getElement('i', { class: icon }),
                    getElement('span', {}, [document.createTextNode(stat)]),
                ]),
                getElement('span', { class: 'statistics__description' }, [
                    document.createTextNode(title),
                ]),
            ])
        )
    }

    await new Promise((res) => setTimeout(res, 1000))

    statisticsLoader.loaded()
}

const contributionsLoader = new Loader('contributions')
let lastDate

const loadContributions = async (user, type = 'all', start = 0, count = 5) => {
    const content = contributionsLoader.getContent()

    try {
        const response = await getContributions({
            id: user.id,
            start,
            count,
            type,
        })

        let length = 0

        for (const { date, contributions } of response) {
            if (lastDate != date) {
                content.appendChild(
                    getElement('div', { class: 'contributions__date' }, [
                        getElement('div', { class: 'contributions__rule' }),
                        getElement('i', { class: 'fa-regular fa-calendar' }),
                        getElement('span', {}, [document.createTextNode(date)]),
                        getElement('div', { class: 'contributions__rule' }),
                    ])
                )

                lastDate = date
            }

            length += contributions.length

            for (const contribution of contributions) {
                content.appendChild(
                    new ContributionCard(user, contribution).inner
                )
            }
        }

        content.appendChild(
            length > 0
                ? getElement(
                      'button',
                      {
                          class: 'btn',
                          onclick: () => {
                              content.lastChild.remove()
                              loadContributions(
                                  user,
                                  type,
                                  start + length,
                                  count
                              )
                          },
                      },
                      [document.createTextNode('Load more')]
                  )
                : getElement(
                      'button',
                      {
                          class: 'btn',
                          disabled: true,
                      },
                      [document.createTextNode('End of content')]
                  )
        )
    } catch (e) {
        console.error(e)
    }

    contributionsLoader.loaded()
}

let user

window.onload = async () => {
    let userId
    const path = location.pathname.replace('/profile', '')

    if (path.length == 0) {
        userId = JSON.parse(sessionStorage.getItem('user'))

        if (!userId) {
            location.assign('/')
        }

        userId = userId.id
    } else {
        userId = parseInt(path.slice(1))
    }

    try {
        user = await getUser(userId)

        loadProfile(user)
        loadTopAccomplishments(user)
        loadStatistics(user)
        loadContributions(user)
    } catch (e) {
        if (e.code == 1010) {
            location.assign('/error')
        }
    }
}

const onChoice = async (option) => {
    contributionsLoader.loading()
    lastDate = null

    const content = contributionsLoader.getContent()

    while (content.firstChild) {
        content.firstChild.remove()
    }

    loadContributions(user, option.value)
}

window.dropdown = new Dropdown(
    'dropdown',
    {
        all: { title: 'All', value: 'all' },
        pending: { title: 'Pending', value: 'pending' },
        annotation: { title: 'Annotations', value: 'annotation' },
        album: { title: 'Albums', value: 'album' },
        poem: { title: 'Poems', value: 'poem' },
    },
    onChoice
)
