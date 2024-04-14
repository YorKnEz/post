export class Share {
    constructor(section, shareUrl) {
        this.section = section
        // inject logic into share section
        this.section
            .querySelectorAll('.share__row')
            .forEach(
                (row) =>
                    (row.getElementsByTagName('button').item(0).onclick =
                        this.copy)
            )
        this.section.querySelector('.share__input').value = shareUrl
    }

    shown = () => {
        return !this.section.classList.contains('hidden')
    }

    toggle = () => {
        this.section.previousElementSibling.classList.toggle('hidden')
        this.section.classList.toggle('hidden')
    }

    share = (to) => {
        console.log(`share to ${to}`)
    }

    copy(ev) {
        navigator.clipboard.writeText(ev.target.previousElementSibling.value)
    }
}
