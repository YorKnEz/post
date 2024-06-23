import { autoGrow, scrollToElem } from '../../utils/index.js'
import {
    Annotation,
    AnnotationSystem,
    Dropdown,
    LyricsEdit,
    Navbar,
    Share,
} from '../../components/index.js'

window.navbar = new Navbar()

window.lyricsEdit = new LyricsEdit()
window.autoGrow = autoGrow

window.dropdown = new Dropdown('languages-dropdown')

window.lyricsShare = new Share(
    document.getElementById('lyrics-share'),
    `${location.origin}/pages/poem/`
)

window.annotation = new AnnotationSystem()

window.about = new Annotation(
    'about',
    `${location.origin}${location.pathname}/#about`
)
// scroll to about section taking into account the nav height
window.scrollToAbout = () => {
    scrollToElem(document.getElementById('about'))
}

document.onclick = (ev) => {
    window.dropdown.disappear(ev)
    window.annotation.disappearAnnotation(ev)
}

window.onresize = () => {
    window.dropdown.align()
    window.annotation.align()
}

const scrollToNewAnnotation = (annotation) => {
    window.annotation.card.setAnnotation(annotation)
    window.annotation.toggleAnnotation()

    // if annotation appeared, update the location hash and scroll to annotation
    if (window.annotation.card.shown()) {
        location.hash = annotation.id
        scrollToElem(annotation)
    }
}

// checks if the current path links to an annotation and scrolls to it
;(() => {
    if (location.hash.length > 0) {
        let annotation = document.getElementById(location.hash.substring(1))
        if (annotation && annotation.classList.contains('poem__annotated')) {
            scrollToNewAnnotation(annotation)
        }
    }
})()

// after each click on an annotation, scroll to it if possible
window.addEventListener('annotation', ({ annotation }) =>
    scrollToNewAnnotation(annotation)
)
