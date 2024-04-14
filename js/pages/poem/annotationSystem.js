import { CreateAnnotation } from './createAnnotation.js'
import { AnnotationCard } from './annotation.js'

class AnnotationButton {
    constructor(annotate) {
        this.button = document.createElement('button')
        this.button.innerHTML = 'Annotate'
        this.button.style.position = 'absolute'
        this.button.classList.add('btn')
        this.button.onclick = annotate
    }

    // align button under selection
    align = (selection) => {
        const bounds = selection.getRangeAt(0).getBoundingClientRect()
        document.body.appendChild(this.button)
        this.button.style.top = window.scrollY + bounds.bottom + 4 + 'px'
        this.button.style.left =
            bounds.left +
            bounds.width / 2 -
            this.button.getBoundingClientRect().width / 2 +
            'px'
    }

    // hide the button from the screen
    remove = () => {
        if (document.body.contains(this.button)) {
            document.body.removeChild(this.button)
        }
    }
}

export class AnnotationSystem {
    constructor() {
        this.root = document.getElementById('lyrics')
        this.button = new AnnotationButton(this.annotate)
        this.createCard = new CreateAnnotation()
        this.card = new AnnotationCard('annotation', location.href)
        this.range
        this.region

        document.onmouseup = document.onselectionchange = this.onselection

        document.querySelectorAll('.poem__annotated').forEach((annotated) => {
            annotated.onclick = (ev) => {
                location.replace(
                    `${location.origin}/pages/poem/${ev.target.id}`
                )
            }
        })
    }

    // checks whether a node is annotated or is a child of an annotated element
    static annotated = (node) => {
        return (
            node.parentNode.classList.contains('poem__annotated') ||
            node?.classList?.contains('poem__annotated')
        )
    }

    // update the selection
    onselection = (ev) => {
        // dont update if createAnnotation card is already opened
        if (this.createCard.shown()) {
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
                    this.root != this.range.startContainer &&
                    this.root != this.range.endContainer &&
                    this.root.contains(this.range.startContainer) &&
                    this.root.contains(this.range.endContainer)
                )
            ) {
                allText = false
                break
            }

            // make sure end is not annotated, because otherwise weird checks have
            // to be done in the while below
            if (
                AnnotationSystem.annotated(this.range.startContainer) ||
                AnnotationSystem.annotated(this.range.endContainer)
            ) {
                allText = false
                break
            }

            let current = this.range.startContainer

            while (current != this.range.endContainer) {
                if (AnnotationSystem.annotated(current)) {
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

        this.button.align(selection)
    }

    // realize the annotation on the selected text range
    annotate = () => {
        // create the annotated element
        this.region = document.createElement('a')
        this.region.classList.add('poem__annotated', 'poem__annotated--active')

        // one line selection
        if (this.range.startContainer == this.range.endContainer) {
            let beforeRegion = document.createTextNode(
                this.range.startContainer.nodeValue.substr(
                    0,
                    this.range.startOffset
                )
            )

            this.region.innerHTML = this.range.startContainer.nodeValue.substr(
                this.range.startOffset,
                this.range.endOffset - this.range.startOffset
            )

            let afterRegion = document.createTextNode(
                this.range.startContainer.nodeValue.substr(this.range.endOffset)
            )

            this.root.insertBefore(afterRegion, this.range.startContainer)
            this.root.insertBefore(this.region, afterRegion)
            this.root.insertBefore(beforeRegion, this.region)

            this.root.removeChild(this.range.startContainer)
        }
        // multiple line selection
        else {
            let beforeRegion = document.createTextNode(
                this.range.startContainer.nodeValue.substr(
                    0,
                    this.range.startOffset
                )
            )

            this.region.innerHTML = this.range.startContainer.nodeValue.substr(
                this.range.startOffset
            )

            let current = this.range.startContainer.nextSibling
            let prev

            while (current != this.range.endContainer) {
                prev = current
                current = current.nextSibling

                if (prev.nodeName == '#text') {
                    this.region.innerHTML += prev.nodeValue
                    this.root.removeChild(prev)
                } else {
                    this.region.appendChild(prev)
                }
            }

            this.region.innerHTML += this.range.endContainer.nodeValue.substr(
                0,
                this.range.endOffset
            )

            let afterRegion = document.createTextNode(
                this.range.endContainer.nodeValue.substr(this.range.endOffset)
            )

            this.root.insertBefore(afterRegion, this.range.startContainer)
            this.root.insertBefore(this.region, afterRegion)
            this.root.insertBefore(beforeRegion, this.region)

            this.root.removeChild(this.range.startContainer)
            this.root.removeChild(this.range.endContainer)
        }

        this.button.remove()
        this.toggleCreateAnnotation()
    }

    // align children cards
    align = () => {
        if (this.createCard.shown()) {
            this.createCard.align(this.region) // align only if shown
        }

        if (this.card.shown()) {
            this.card.align() // align only if shown
        }
    }

    toggleAnnotation = () => {
        this.card.toggle()
    }

    disappearAnnotation = (ev) => {
        this.card.disappear(ev)
    }

    toggleCreateAnnotation = () => {
        this.createCard.toggle(this.region)
    }
}
