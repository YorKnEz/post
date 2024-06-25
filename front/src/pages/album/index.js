import { getElement, scrollToElem } from '../../utils/index.js'
import { Loader, Navbar, PostRow, Share } from '../../components/index.js'
import { getAlbum } from '../../services/lyrical.js'

window.navbar = new Navbar()

const albumLoader = new Loader('album')
let album

const loadAlbum = async (id) => {
    const content = albumLoader.getContent()

    album = await getAlbum(id)

    content.append(
        ...[
            getElement('img', {
                class: 'album__avatar col-xs-4 col-sm-4 col-md-5',
                src: album.cover,
                alt: `cover of ${album.title}`,
            }),
            getElement(
                'div',
                {
                    class: 'album__container col-xs-4 col-sm-4 col-md-7',
                },
                [
                    getElement('div', {}, [
                        getElement('h1', { class: 'album__title' }, [
                            document.createTextNode(album.title),
                        ]),
                        getElement(
                            'a',
                            {
                                class: 'album__author',
                                href: `/profile/${album.author.id}`,
                            },
                            [document.createTextNode(album.author.nickname)]
                        ),
                    ]),
                    getElement('div', { class: 'album__info' }, [
                        getElement('div', { class: 'album__item' }, [
                            getElement('i', { class: 'fa-solid fa-calendar' }),
                            getElement('span', {}, [
                                document.createTextNode(
                                    new Date(
                                        album.createdAt
                                    ).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: '2-digit',
                                    })
                                ),
                            ]),
                        ]),
                        getElement('div', { class: 'album__item' }, [
                            getElement('i', { class: 'fa-solid fa-eye' }),
                            getElement('span', {}, [
                                document.createTextNode(album.likes),
                            ]),
                        ]),
                    ]),
                ]
            ),
        ]
    )

    albumLoader.loaded()
}

const albumHeaderLoader = new Loader('album-header')

const loadAlbumHeader = async (album) => {
    const content = albumHeaderLoader.getContent()

    content.appendChild(
        getElement('div', { class: 'album__item' }, [
            getElement('i', { class: 'fa-solid fa-circle-info' }),
            getElement('span', {}, [
                document.createTextNode(`Poems of ${album.title}`),
            ]),
        ])
    )
    content.appendChild(
        getElement('button', { class: 'btn btn--link album__item' }, [
            getElement('i', { class: 'fa-solid fa-user-group btn__icon' }),
            getElement('span', { class: 'btn__label' }, [
                document.createTextNode(`${album.contributors} contributors`),
            ]),
        ])
    )

    albumHeaderLoader.loaded()
}

const poemsLoader = new Loader('poem-section')

const loadPoems = async (album) => {
    const content = poemsLoader.getContent()

    if (album.poems.length === 0) {
        content.appendChild(
            getElement('h1', {}, [document.createTextNode('No poems here.')])
        )
    } else {
        for (const index in album.poems) {
            content.appendChild(
                new PostRow(parseInt(index) + 1, album.poems[index]).inner
            )
        }
    }

    content.appendChild(
        new Share('Share this album', {
            title: `Check out this album ${album.title}`,
            content: `The album is made by ${album.author.nickname} and has ${album.poems.length} poems`,
            url: location.href,
        }).inner
    )

    poemsLoader.loaded()
}

window.onload = async () => {
    const albumId = parseInt(location.pathname.replace('/album', '').slice(1))

    try {
        await loadAlbum(albumId)

        document.title = `${album.author.nickname} - ${album.title}`

        loadAlbumHeader(album)
        loadPoems(album)
    } catch (e) {
        location.assign('/error')
        console.error(e)
    }
}
