import { autoGrow, htmlToText } from '../../utils.js'

export class LyricsEdit {
    constructor() {
        this.editButton = document.getElementById('edit-button')
        this.lyricsContainer = document.getElementById('lyrics-container')
        this.lyricsTextareaContainer = document.getElementById(
            'lyrics-textarea-container'
        )
        this.lyrics = document.getElementById('lyrics')
        this.textarea = document.getElementById('lyrics-textarea')
    }

    toggle = () => {
        this.editButton.classList.toggle('hidden')
        this.lyricsContainer.classList.toggle('hidden')
        this.lyricsTextareaContainer.classList.toggle('hidden')

        if (this.lyricsTextareaContainer.classList.contains('hidden')) {
            return
        }

        this.textarea.innerHTML = htmlToText(this.lyrics.innerHTML)
        // resize the textarea to fit the initial text
        autoGrow(this.textarea)
    }

    save = () => {
        console.log('save')
        this.toggle()
    }

    cancel = () => {
        this.toggle()
    }
}
