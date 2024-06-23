import { autoGrow, getElement, scrollToElem } from '../../utils/index.js'
import {
    Annotation,
    AnnotationSystem,
    Dropdown,
    Loader,
    Lyrics,
    Navbar,
} from '../../components/index.js'
import { getPoem, getPoemTranslations } from '../../services/lyrical.js'
import { AnnotationsHandler } from '../../components/_annotation/index.js'

window.navbar = new Navbar()

// window.annotation = new AnnotationSystem()
//
// window.about = new Annotation(
//     'about',
//     `${location.origin}${location.pathname}/#about`
// )
//
// document.onclick = (ev) => {
//     window.annotation.disappearAnnotation(ev)
// }
//
// window.onresize = () => {
//     window.annotation.align()
// }
//
// const scrollToNewAnnotation = (annotation) => {
//     window.annotation.card.setAnnotation(annotation)
//     window.annotation.toggleAnnotation()
//
//     // if annotation appeared, update the location hash and scroll to annotation
//     if (window.annotation.card.shown()) {
//         location.hash = annotation.id
//         scrollToElem(annotation)
//     }
// }
//
//     // checks if the current path links to an annotation and scrolls to it
//     ; (() => {
//         if (location.hash.length > 0) {
//             let annotation = document.getElementById(location.hash.substring(1))
//             if (annotation && annotation.classList.contains('poem__annotated')) {
//                 scrollToNewAnnotation(annotation)
//             }
//         }
//     })()
//
// // after each click on an annotation, scroll to it if possible
// window.addEventListener('annotation', ({ annotation }) =>
//     scrollToNewAnnotation(annotation)
// )

const poemLoader = new Loader('poem')
let poem

const loadPoem = async (id) => {
    const content = poemLoader.getContent()

    poem = await getPoem(id)

    content.appendChild(
        getElement(
            'div',
            {
                class: 'col-xs-4 col-sm-3 col-md-4 col-lg-5 poem__avatar-container',
            },
            [
                getElement('img', {
                    class: 'poem__avatar',
                    src: poem.cover,
                    alt: `cover of ${poem.title}`,
                }),
            ]
        )
    )
    content.appendChild(
        getElement(
            'div',
            {
                class: 'poem__container col-xs-4 off-sm-4 col-sm-5 off-md-5 col-md-8 off-lg-6 col-lg-7',
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
                        document.createTextNode(poem.mainAnnotation.content),
                        getElement(
                            'button',
                            {
                                class: 'col-xs-2 btn btn--link',
                                onclick: () =>
                                    scrollToElem(
                                        document.getElementById('about')
                                    ),
                            },
                            [
                                getElement('span', { class: 'btn__label' }, [
                                    document.createTextNode('Read more'),
                                ]),
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
        )
    )

    poemLoader.loaded()
}

const poemHeaderLoader = new Loader('poem-header')
let translations

const onOption = (option) => {
    location.assign(`/poem/${option.value}`)
}

const loadPoemHeader = async (poem) => {
    const content = poemHeaderLoader.getContent()

    translations = await getPoemTranslations(poem.id)

    content.appendChild(
        getElement('div', { class: 'poem__item' }, [
            getElement('i', { class: 'fa-solid fa-circle-info' }),
            getElement('span', {}, [
                document.createTextNode(`${poem.title} lyrics`),
            ]),
        ])
    )
    content.appendChild(
        getElement('div', { class: 'poem__item' }, [
            getElement('i', { class: 'fa-solid fa-language' }),
            getElement('div', { id: 'languages-dropdown', class: 'dropdown' }, [
                getElement('span', { class: 'dropdown__text' }, [
                    document.createTextNode(`Languages`),
                ]),
                getElement('div', { class: 'dropdown__container hidden' }),
            ]),
        ])
    )
    content.appendChild(
        getElement('button', { class: 'btn btn--link poem__item' }, [
            getElement('i', { class: 'fa-solid fa-user-group btn__icon' }),
            getElement('span', { class: 'btn__label' }, [
                document.createTextNode(`${poem.contributors} contributors`),
            ]),
        ])
    )

    poemHeaderLoader.loaded()

    window.dropdown = new Dropdown('languages-dropdown', translations, onOption)
}

const lyricsLoader = new Loader('lyrics')
let lyrics

const loadLyrics = async (poem) => {
    const content = lyricsLoader.getContent()

    const editButton = document.getElementById('edit-button')

    lyrics = new Lyrics(content, poem, () => {
        editButton.classList.toggle('hidden')
    })

    editButton.addEventListener('click', lyrics.state.toggle)

    lyricsLoader.loaded()

    new AnnotationsHandler()
}

window.onload = async () => {
    const poemId = parseInt(location.pathname.replace('/poem', '').slice(1))

    try {
        await loadPoem(poemId)

        document.title = `${poem.author.nickname} - ${poem.title}`

        loadPoemHeader(poem)
        loadLyrics(poem)
    } catch (e) {
        location.assign('/error')
        console.error(e)
    }
}
