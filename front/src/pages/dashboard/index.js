import {
    DeleteCard,
    Loader,
    Navbar,
    RequestApproveCard,
} from '../../components/index.js'
import {
    getAlbums,
    getAnnotations,
    getPoems,
    getRequests,
    getStats,
    getUsers,
} from '../../services/index.js'
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

    statisticsLoader.loaded()
}

const loaders = [
    { loader: new Loader('poetic-requests'), type: 'user' },
    { loader: new Loader('album-requests'), type: 'album' },
    { loader: new Loader('poem-requests'), type: 'poem' },
    { loader: new Loader('annotation-requests'), type: 'annotation' },
]

const loadRequests = async (loader, type, length = 0, start = 0, count = 5) => {
    const content = loader.getContent()
    const response = await getRequests({ type, start, count })

    for (const request of response) {
        content.appendChild(new RequestApproveCard(request, type).inner)
    }

    content.appendChild(
        response.length > 0
            ? getElement(
                  'button',
                  {
                      class: 'btn',
                      onclick: () => {
                          content.lastChild.remove()
                          loadRequests(
                              loader,
                              type,
                              length + response.length,
                              start + response.length,
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

const deleteLoaders = [
    { loader: new Loader('users-delete'), type: 'user', getData: getUsers },
    { loader: new Loader('albums-delete'), type: 'album', getData: getAlbums },
    { loader: new Loader('poems-delete'), type: 'poem', getData: getPoems },
    {
        loader: new Loader('annotations-delete'),
        type: 'annotation',
        getData: getAnnotations,
    },
]

const loadEntities = async (
    loader,
    type,
    getData,
    length = 0,
    start = 0,
    count = 5
) => {
    const content = loader.getContent()
    const response = await getData({
        type,
        start,
        count,
        sort: 'new',
        order: 'desc',
    })

    for (const request of response) {
        content.appendChild(new DeleteCard(request, type).inner)
    }

    content.appendChild(
        response.length > 0
            ? getElement(
                  'button',
                  {
                      class: 'btn',
                      onclick: () => {
                          content.lastChild.remove()
                          loadEntities(
                              loader,
                              type,
                              getData,
                              length + response.length,
                              start + response.length,
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
        await loadStatistics()

        for (const { loader, type } of loaders) {
            loadRequests(loader, type)
        }

        for (const { loader, type, getData } of deleteLoaders) {
            loadEntities(loader, type, getData)
        }
    } catch (e) {
        console.error(e)
    }
}
