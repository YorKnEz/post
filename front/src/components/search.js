import { getElement } from '../utils/index.js'

export class Search {
    constructor(id, style = 'nav') {
        this.id = id
        this.input = getElement('input', {
            id: id + '_input',
            class: 'search__input',
            placeholder: 'Search',
            onkeydown: this.handleKeyDown,
        })

        this.inner = getElement(
            'div',
            {
                id,
                class: `search ${style == 'nav' ? 'search--nav nav__item' : 'search--sidebar'}`,
            },
            [
                getElement('i', {
                    class: `fa-solid fa-magnifying-glass ${style == 'nav' ? 'search__icon' : 'sidebar__icon'}`,
                    onclick: this.search,
                }),
                this.input,
            ]
        )
    }

    search = () => {
        console.log(this.input.value)
    }

    handleKeyDown = (event) => {
        if (event.keyCode === 13) {
            //enter was pressed
            this.search()
        }
    }
}
