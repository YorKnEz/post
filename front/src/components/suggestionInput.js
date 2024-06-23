import { getElement } from '../utils/index.js'

export class SuggestionInput {
    constructor(id, dropdownId, suggest, cb) {
        this.input = document.getElementById(id)
        this.input.addEventListener('input', this.update)
        this.input.addEventListener('click', this.update)

        this.suggestions = document.getElementById(dropdownId)
        this.suggestions.addEventListener('click', this.optionClick)

        this.cb = cb
        this.suggest = suggest

        document.addEventListener('click', this.disappear)
    }

    update = async (ev) => {
        //hide
        if (this.input.value.length < 3) {
            if (this.shown()) {
                this.toggleSuggestions()
            }
            return
        }

        if (this.input.value.length >= 3 && !this.shown()) {
            this.toggleSuggestions()
        }

        // fetch data from the server
        try {
            this.options = await this.suggest(this.input.value)
        } catch (e) {
            console.error(e)
            this.options = []
        }

        // remove old suggestions
        while (this.suggestions.firstChild) {
            this.suggestions.firstChild.remove()
        }

        for (const index in this.options) {
            const option = this.options[index]
            this.suggestions.appendChild(
                getElement(
                    'span',
                    { class: 'dropdown__item', __option: index },
                    [document.createTextNode(option.value)]
                )
            )
        }
    }

    // handles the case where an user selects an item from the dropdown
    optionClick = (ev) => {
        if (ev.target.classList.contains('dropdown__item')) {
            const option = this.options[ev.target.getAttribute('__option')]
            this.input.value = option.value
            this.toggleSuggestions()

            this.cb(option)
        }
    }

    shown = () => {
        return !this.suggestions.classList.contains('hidden')
    }

    toggleSuggestions = () => {
        this.suggestions.classList.toggle('hidden')
    }

    disappear = (ev) => {
        if (
            this.suggestions.contains(ev.target) ||
            this.input.contains(ev.target) ||
            !this.shown()
        ) {
            return
        }

        this.toggleSuggestions()
    }
}
