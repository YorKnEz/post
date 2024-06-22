export class Modal {
    constructor(id, onclose) {
        this.modal = document.getElementById(id)
        this.onclose = onclose
    }

    open = () => {
        this.modal.classList.remove('hidden')
    }

    close = () => {
        this.modal.classList.add('hidden')
        this.onclose()
    }

    setContent = (newContent) => {
        const content = this.modal.getElementsByClassName('modal__content')[0]
        content.replaceChildren(newContent)
    }
}
