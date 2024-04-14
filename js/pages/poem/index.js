import { autoGrow, scrollToElem, toggleTheme } from '../../utils.js'
import { Dropdown } from '../../components/dropdown.js'
import { LyricsEdit } from './lyricsEdit.js'
import { AnnotationSystem } from './annotationSystem.js'
import { Annotation } from './annotation.js'
import { Share } from '../../components/share.js'

window.toggleTheme = toggleTheme

window.lyricsEdit = new LyricsEdit()
window.autoGrow = autoGrow

window.dropdown = new Dropdown('languages-dropdown')

window.lyricsShare = new Share(
    document.getElementById('lyrics-share'),
    `${location.origin}/pages/poem/`
)

window.annotation = new AnnotationSystem()

window.about = new Annotation('about', `${location.origin}/pages/poem/#about`)
// scroll to about section taking into account the nav height
window.scrollToAbout = () => {
    scrollToElem(document.getElementById('about'))
}

document.onclick = (ev) => {
    dropdown.disappear(ev)
    annotation.disappearAnnotation(ev)
}

window.onresize = (ev) => {
    dropdown.align()
    annotation.align()
}

// checks if the current path links to an annotation and scrolls to it
;(() => {
    let path = location.pathname.split('/').filter((s) => s.length > 0)
    let annotation = document.getElementById(path[path.length - 1])
    if (annotation && annotation.classList.contains('poem__annotated')) {
        window.annotation.card.annotation = annotation
        window.annotation.toggleAnnotation()
        scrollToElem(annotation)
    }
})()
