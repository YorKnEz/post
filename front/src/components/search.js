import { getElement } from '../utils/index.js'

export class Search {
    constructor(id, style = 'nav') {
        this.id = id
        this.input = getElement('input', {
            id: id + '_input',
            class: 'search__input',
            placeholder: 'Search',
        })

        this.input.addEventListener('keydown', this.handleKeyDown)

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
        if (location.pathname === '/search') {
            const params = new URLSearchParams(location.search)
            params.set('query', this.input.value)
            location.search = params.toString()
        } else {
            location.assign(`/search?query=${encodeURIComponent(query)}`)
        }
    }

    handleKeyDown = (event) => {
        if (event.keyCode === 13) {
            //enter was pressed
            this.search()
        }
    }
}
