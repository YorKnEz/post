export class CreateAnnotation {
    constructor() {
        this.card = document.getElementById('annotate')
    }

    // whether the element is present on screen or not
    shown = () => {
        return !this.card.classList.contains('hidden')
    }

    // align annotation box to region
    align = (region) => {
        const bounds = this.card.getBoundingClientRect()
        const lyricsBounds = document
            .getElementById('lyrics')
            .getBoundingClientRect()

        this.card.style.top =
            Math.min(
                region.getBoundingClientRect().top - lyricsBounds.top,
                lyricsBounds.height - bounds.height
            ) + 'px'
    }

    toggle = (region) => {
        this.card.classList.toggle('hidden')

        if (this.shown()) {
            this.align(region) // align only if the element is shown
        } else {
            location.reload()
        }
    }

    save = (ev) => {
        console.log('save')
    }
}
