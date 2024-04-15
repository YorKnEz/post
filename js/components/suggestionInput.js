export class SuggestionInput {
    constructor(id, dropdownId) {
        this.input = document.getElementById(id)
        this.suggestions = document.getElementById(dropdownId)

        this.input.oninput = this.input.onclick = (ev) => {
            //hide
            if (this.input.value.length < 3 && this.shown()) {
                this.toggleSuggestions()
                return
            }
            
            if (this.input.value.length >= 3 && !this.shown()) {
                this.toggleSuggestions()
            }

            this.update()
        }

        this.suggestions.onclick = this.optionClick
    }

    shown = () => {
        return !this.suggestions.classList.contains('hidden')
    }

    toggleSuggestions = () => {
        this.suggestions.classList.toggle('hidden')
    }

    update = () => {
        // get data from server
        const data = [
            'Title 1',
            'Wuuuuu haaaaaa, testyy testtt',
            'Title 3',
            'Wuuuuu haaaaaa, testyy testtt',
            'Wuuuuu haaaaaa, testyy testtt',
            'Wuuuuu haaaaaa, testyy testtt',
            'What the hell is this really long title that breaks the time-space continuum',
            'Wuuuuu haaaaaa, testyy testtt',
            'Wuuuuu haaaaaa, testyy testtt',
            'Wuuuuu haaaaaa, testyy testtt',
        ]

        this.suggestions.innerHTML = ''
        data.forEach((item) => {
            const element = document.createElement('span')
            element.classList.add('dropdown__item')
            element.innerHTML = item
            this.suggestions.appendChild(element)
        })
    }

    // handles the case where an user selects an item from the dropdown
    optionClick = (ev) => {
        if (ev.target.classList.contains('dropdown__item')) {
            console.log(ev.target.innerText)
            this.input.value = ev.target.innerText
            this.toggleSuggestions()
        }
    }

    disappear = (ev) => {
        if (this.suggestions.contains(ev.target) || this.input.contains(ev.target) || !this.shown()) {
            return
        }

        this.toggleSuggestions()
    }
}
