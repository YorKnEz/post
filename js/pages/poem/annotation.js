import { Share } from '../../components/share.js'
import { autoGrow, htmlToText, removeHashFromURL } from '../../utils.js'

export class Annotation {
    constructor(id, shareUrl) {
        this.card = document.getElementById(id)
        this.header = this.card.querySelector('.annotation__header')
        this.text = this.card.querySelector('.annotation__text')
        this.textarea = this.card.querySelector('.annotation__textarea')
        this.footer = this.card.querySelector('.annotation__footer')
        this.editFooter = this.card.querySelector('.annotation__edit-footer')
        this.shareObj = new Share(this.card.querySelector('.share'), shareUrl)
    }

    like = (ev) => {
        console.log('like')
    }

    dislike = (ev) => {
        console.log('dislike')
    }

    toggleShare = (ev) => {
        this.shareObj.toggle()
    }

    // made to be a function so subclasses can call it
    edit = (ev) => {
        if (this.shareObj.shown()) {
            this.toggleShare()
        }

        this.header.classList.toggle('hidden')

        this.text.classList.toggle('hidden')
        this.textarea.classList.toggle('hidden')

        this.textarea.innerHTML = htmlToText(this.text.innerHTML)
        // resize the textarea to fit the initial text
        autoGrow(this.textarea)

        this.footer.classList.toggle('hidden')
        this.editFooter.classList.toggle('hidden')
    }

    save = (ev) => {
        console.log('save')
    }

    cancel = (ev) => {
        this.edit(ev)
    }

    share = (to) => {
        this.shareObj.share(to)
    }
}

export class AnnotationCard extends Annotation {
    constructor(id, shareUrl) {
        super(id, shareUrl)
        this.annotation
    }

    // updates the annotation, hiding the old one if needed
    setAnnotation = (annotation) => {
        if (this.shown()) {
            this.toggle()
        }

        this.annotation = annotation
    }

    // whether the element is present on screen or not
    shown = () => {
        return !this.card.classList.contains('hidden')
    }

    // align annotation card to the annotation
    align = () => {
        const bounds = this.card.getBoundingClientRect()
        const lyricsBounds = document
            .getElementById('lyrics')
            .getBoundingClientRect()

        this.card.style.top =
            Math.min(
                this.annotation.getBoundingClientRect().top - lyricsBounds.top,
                lyricsBounds.height - bounds.height
            ) + 'px'
    }

    toggle = () => {
        this.card.classList.toggle('hidden')
        this.annotation.classList.toggle('poem__annotated--active')

        if (this.shown()) {
            this.align() // align only if shown
        } else {
            removeHashFromURL()
        }
    }

    // when user clicks anywhere but on the annotation
    disappear = (ev) => {
        if (this.shown() && !this.card.contains(ev.target) && !this.annotation.contains(ev.target)) {
            this.toggle()
            removeHashFromURL()
        }
    }

    edit = (ev) => {
        if (this.shareObj.shown()) {
            this.toggleShare()
        }

        this.header.classList.toggle('hidden')
        this.text.classList.toggle('hidden')
        this.textarea.classList.toggle('hidden')
        this.textarea.innerHTML = this.text.innerHTML
            .trim()
            .replace(/(<([^>]+)>)/gi, '')
            .split('\n')
            .map((line) => line.trim())
            .join('\n')
        autoGrow(this.textarea)

        this.footer.classList.toggle('hidden')
        this.editFooter.classList.toggle('hidden')

        this.align()
    }

    share = (to) => {
        this.shareObj.share(to)
    }

    toggleShare = (ev) => {
        this.shareObj.toggle()

        this.align()
    }
}
