import { getElement, scrollToElem } from '../../utils/index.js'
import { Dropdown, Loader, Lyrics, Navbar } from '../../components/index.js'
import { getPoem, getPoemTranslations } from '../../services/index.js'
import { Annotation } from '../../components/annotation/index.js'

window.navbar = new Navbar()

const poemLoader = new Loader('poem')
let poem

const loadPoem = async (id) => {
    const content = poemLoader.getContent()

    poem = await getPoem(id)

    content.append(
        ...[
            getElement('img', {
                class: 'poem__avatar col-xs-4 col-sm-4 col-md-5',
                src: poem.cover,
                alt: `cover of ${poem.title}`,
            }),
            getElement(
                'div',
                {
                    class: 'poem__container col-xs-4 col-sm-4 col-md-7',
                },
                [
                    getElement('div', {}, [
                        getElement('h1', { class: 'poem__title' }, [
                            document.createTextNode(poem.title),
                        ]),
                        getElement(
                            'a',
                            {
                                class: 'poem__author',
                                href: `/profile/${poem.author.id}`,
                            },
                            [document.createTextNode(poem.author.nickname)]
                        ),
                        getElement('p', {}, [
                            document.createTextNode(
                                poem.mainAnnotation.content
                            ),
                            getElement(
                                'button',
                                {
                                    class: 'col-xs-2 btn btn--link',
                                    onclick: () => {
                                        location.hash = 'about'
                                        scrollToElem(
                                            document.getElementById('about')
                                        )
                                    },
                                },
                                [
                                    getElement(
                                        'span',
                                        { class: 'btn__label' },
                                        [document.createTextNode('Read more')]
                                    ),
                                ]
                            ),
                        ]),
                    ]),
                    getElement('div', { class: 'poem__info' }, [
                        getElement('div', { class: 'poem__item' }, [
                            getElement('i', { class: 'fa-solid fa-calendar' }),
                            getElement('span', {}, [
                                document.createTextNode(
                                    new Date(poem.createdAt).toLocaleDateString(
                                        'en-US',
                                        {
                                            year: 'numeric',
                                            month: 'short',
                                            day: '2-digit',
                                        }
                                    )
                                ),
                            ]),
                        ]),
                        getElement('div', { class: 'poem__item' }, [
                            getElement('i', { class: 'fa-solid fa-eye' }),
                            getElement('span', {}, [
                                document.createTextNode(poem.likes),
                            ]),
                        ]),
                    ]),
                ]
            ),
        ]
    )

    poemLoader.loaded()
}

const poemHeaderLoader = new Loader('poem-header')

const loadPoemHeader = async (poem) => {
    const content = poemHeaderLoader.getContent()

    const translations = await getPoemTranslations(poem.id)

    content.append(
        ...[
            getElement('div', { class: 'poem__item' }, [
                getElement('i', { class: 'fa-solid fa-circle-info' }),
                getElement('span', {}, [
                    document.createTextNode(`${poem.title} lyrics`),
                ]),
            ]),
            getElement('div', { class: 'poem__item' }, [
                getElement('i', { class: 'fa-solid fa-language' }),
                getElement(
                    'div',
                    { id: 'languages-dropdown', class: 'dropdown' },
                    [
                        getElement('span', { class: 'dropdown__text' }, [
                            document.createTextNode(`Languages`),
                        ]),
                        getElement('div', {
                            class: 'dropdown__container hidden',
                        }),
                    ]
                ),
            ]),
            getElement('button', { class: 'btn btn--link poem__item' }, [
                getElement('i', { class: 'fa-solid fa-user-group btn__icon' }),
                getElement('span', { class: 'btn__label' }, [
                    document.createTextNode(
                        `${poem.contributors} contributors`
                    ),
                ]),
            ]),
        ]
    )

    poemHeaderLoader.loaded()

    window.dropdown = new Dropdown(
        'languages-dropdown',
        translations,
        (option) => {
            location.assign(`/poem/${option.value}`)
        },
        poem.id
    )
}

const lyricsLoader = new Loader('lyrics')

const loadLyrics = async (poem) => {
    const content = lyricsLoader.getContent()

    const editButton = document.getElementById('edit-button')

    const lyrics = new Lyrics(content, poem, () => {
        editButton.classList.toggle('hidden')
    })

    editButton.addEventListener('click', lyrics.state.toggle)

    lyricsLoader.loaded()
}

const aboutLoader = new Loader('about')

const loadAbout = async (poem) => {
    const content = aboutLoader.getContent()

    content.append(new Annotation(poem.mainAnnotation, poem).inner)

    aboutLoader.loaded()
}

window.onload = async () => {
    const poemId = parseInt(location.pathname.replace('/poem', '').slice(1))

    try {
        await loadPoem(poemId)

        document.title = `${poem.author.nickname} - ${poem.title}`

        loadPoemHeader(poem)
        loadLyrics(poem)
        loadAbout(poem)
    } catch (e) {
        location.assign('/error')
        console.error(e)
    }
}
