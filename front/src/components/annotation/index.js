import { AnnotationButton } from './annotationButton.js'
import { AnnotationClickEvent } from '../events/index.js'
import { CreateAnnotation } from './createAnnotation.js'
import { EmptyAnnotation } from './emptyAnnotation.js'
import { ViewAnnotation } from './viewAnnotation.js'
import { getElement, scrollToElem } from '../../utils/index.js'

export { Annotation } from './component/index.js'

export class AnnotationsHandler {
    constructor(lyrics, poem) {
        this.inner = document.createTextNode('')

        this.lyrics = lyrics
        this.poem = poem

        const hash = location.hash.slice(1)

        for (const element of this.lyrics.getElementsByClassName(
            'poem__annotated'
        )) {
            const id = element.id.replace('annotation-', '')

            if (id === hash) {
                this.annotation = { id, element }
            }

            element.addEventListener('click', () => {
                window.dispatchEvent(new AnnotationClickEvent({ id, element }))
            })
        }

        this.emptyState = new EmptyAnnotation(this)
        this.viewState = new ViewAnnotation(this)
        this.createState = new CreateAnnotation(this)

        if (!this.annotation) {
            location.hash = ''
            this.annotation = {}
            this.setState(this.emptyState)
        } else {
            this.setState(this.viewState)
        }

        this.button = new AnnotationButton(this.annotate)

        this.range
        this.region

        document.addEventListener('mouseup', this.onselection)
        document.addEventListener('selectionchange', this.onselection)
    }

    setState = (state) => {
        this.state?.exit()
        this.state = state
        this.state.enter()
    }

    exit = () => {
        document.removeEventListener('mouseup', this.onselection)
        document.removeEventListener('selectionchange', this.onselection)
    }

    // checks whether a node is annotated or is a child of an annotated element
    annotated = (node) =>
        node.parentNode.classList.contains('poem__annotated') ||
        node?.classList?.contains('poem__annotated')

    // update the selection
    onselection = (ev) => {
        // // dont update if createAnnotation card is already opened
        if (this.state instanceof CreateAnnotation) {
            return
        }

        if (ev.type == 'mouseup' && !window.getSelection) {
            this.button.remove()
            return
        }

        let selection = window.getSelection()

        if (selection.isCollapsed) {
            this.button.remove()
            return
        }

        this.range = selection.getRangeAt(0)
        let allText = true

        do {
            // make sure the selection is made within the root div
            if (
                !(
                    this.lyrics != this.range.startContainer &&
                    this.lyrics != this.range.endContainer &&
                    this.lyrics.contains(this.range.startContainer) &&
                    this.lyrics.contains(this.range.endContainer)
                )
            ) {
                allText = false
                break
            }

            // make sure end is not annotated, because otherwise weird checks have
            // to be done in the while below
            if (
                this.annotated(this.range.startContainer) ||
                this.annotated(this.range.endContainer)
            ) {
                allText = false
                break
            }

            let current = this.range.startContainer

            while (current != this.range.endContainer) {
                if (this.annotated(current)) {
                    allText = false
                    break
                }

                current = current.nextSibling
            }
        } while (0)

        if (!allText) {
            this.button.remove()
            return
        }

        this.button.align(this.range)
    }

    // realize the annotation on the selected text range
    annotate = () => {
        // create the annotated element
        this.region = getElement('a', {
            class: 'poem__annotated poem__annotated--active',
        })

        // one line selection
        if (this.range.startContainer == this.range.endContainer) {
            const beforeRegion = document.createTextNode(
                this.range.startContainer.nodeValue.substring(
                    0,
                    this.range.startOffset
                )
            )

            this.region.append(
                document.createTextNode(
                    this.range.startContainer.nodeValue.substring(
                        this.range.startOffset,
                        this.range.endOffset
                    )
                )
            )

            const afterRegion = document.createTextNode(
                this.range.startContainer.nodeValue.substring(
                    this.range.endOffset
                )
            )

            this.lyrics.insertBefore(afterRegion, this.range.startContainer)
            this.lyrics.insertBefore(this.region, afterRegion)
            this.lyrics.insertBefore(beforeRegion, this.region)

            this.lyrics.removeChild(this.range.startContainer)
        }
        // multiple line selection
        else {
            const beforeRegion = document.createTextNode(
                this.range.startContainer.nodeValue.substring(
                    0,
                    this.range.startOffset
                )
            )

            this.region.append(
                document.createTextNode(
                    this.range.startContainer.nodeValue.substring(
                        this.range.startOffset
                    )
                )
            )

            let current = this.range.startContainer.nextSibling
            let prev

            while (current != this.range.endContainer) {
                prev = current
                current = current.nextSibling

                this.region.append(prev)
            }

            this.region.append(
                document.createTextNode(
                    this.range.endContainer.nodeValue.substring(
                        0,
                        this.range.endOffset
                    )
                )
            )

            let afterRegion = document.createTextNode(
                this.range.endContainer.nodeValue.substring(
                    this.range.endOffset
                )
            )

            this.lyrics.insertBefore(afterRegion, this.range.startContainer)
            this.lyrics.insertBefore(this.region, afterRegion)
            this.lyrics.insertBefore(beforeRegion, this.region)

            this.lyrics.removeChild(this.range.startContainer)
            this.lyrics.removeChild(this.range.endContainer)
        }

        this.button.remove()
        this.setState(this.createState)
    }

    // align annotation card to the annotation
    align = (annotation) => {
        scrollToElem(annotation)

        const bounds = this.inner.getBoundingClientRect()
        const lyricsBounds = this.lyrics.getBoundingClientRect()

        this.inner.style.top =
            Math.min(
                annotation.getBoundingClientRect().top - lyricsBounds.top,
                lyricsBounds.height - bounds.height
            ) + 'px'
    }
}
