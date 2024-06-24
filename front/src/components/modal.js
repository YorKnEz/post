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

    setTitle = (newTitle) => {
        const title = this.modal.getElementsByClassName('modal__title')[0]
        title.innerText = newTitle
    }

    setContent = (newContent) => {
        const content = this.modal.getElementsByClassName('modal__content')[0]
        content.replaceChildren(newContent)
    }
}
