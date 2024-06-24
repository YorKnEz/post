import { Loader, Navbar, UserRow } from '../../components/index.js'
import { getRequests, getStats } from '../../services/admin.js'
import { getElement, isAdmin } from '../../utils/index.js'

window.navbar = new Navbar()

const statisticsLoader = new Loader('statistics')

const loadStatistics = async () => {
    const content = statisticsLoader.getContent()

    const data = await getStats()

    const stats = [
        {
            stat: data.usersCount,
            icon: 'fa-solid fa-quote-left',
            title: 'Users',
        },
        {
            stat: data.verifiedUsersCount,
            icon: 'fa-solid fa-quote-left',
            title: 'Verified Users',
        },
        {
            stat: data.poetsCount,
            icon: 'fa-solid fa-quote-left',
            title: 'Poets',
        },
        {
            stat: data.adminsCount,
            icon: 'fa-solid fa-quote-left',
            title: 'Admins',
        },
        {
            stat: data.contributionsCount,
            icon: 'fa-solid fa-quote-left',
            title: 'Contributions',
        },
        {
            stat: data.albumsCount,
            icon: 'fa-solid fa-quote-left',
            title: 'Albums',
        },
        {
            stat: data.verifiedAlbumsCount,
            icon: 'fa-solid fa-quote-left',
            title: 'Verified Albums',
        },
        {
            stat: data.poemsCount,
            icon: 'fa-solid fa-quote-left',
            title: 'Poems',
        },
        {
            stat: data.verifiedPoemsCount,
            icon: 'fa-solid fa-quote-left',
            title: 'Verified Poems',
        },
        {
            stat: data.annotationsCount,
            icon: 'fa-solid fa-quote-left',
            title: 'Annotations',
        },
        {
            stat: data.verifiedAnnotationsCount,
            icon: 'fa-solid fa-quote-left',
            title: 'Verified Annotations',
        },
        {
            stat: data.likes,
            icon: 'fa-solid fa-quote-left',
            title: 'Likes',
        },
        {
            stat: data.dislikes,
            icon: 'fa-solid fa-quote-left',
            title: 'Dislikes',
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

const loadRequests = async (loader, length = 0, type, start = 0, count = 5) => {
    const content = loader.getContent()
    const response = await getRequests({ type: 'user', start, count })

    for (const index in response) {
        content.appendChild(
            new UserRow(length + parseInt(index) + 1, response[index]).inner
        )
    }

    content.appendChild(
        length > 0
            ? getElement(
                'button',
                {
                    class: 'btn',
                    onclick: () => {
                        content.lastChild.remove()
                        loadRequests(
                            loader,
                            length + response.length,
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

    loader.loaded()
}

window.onload = async () => {
    let user = sessionStorage.getItem('user')

    if (!user) {
        // not logged in
        location.assign('/')
    }

    user = JSON.parse(user)

    if (!isAdmin(user.roles)) {
        // not admin
        location.assign('/')
    }

    try {
        loadStatistics()
        loadPoeticRequests()
    } catch (e) {
        console.error(e)
        location.assign('/error')
    }
}
