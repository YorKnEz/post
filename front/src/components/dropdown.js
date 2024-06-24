import { getElement } from '../utils/index.js'

// `options` represents the options of the dropdown in the format `{value: {title: ...}}`
// `title` is used for displaying the option
//
// By default options[0] is used as default
export class Dropdown {
    constructor(id, options, cb, defaultOption) {
        this.cb = cb

        this.dropdown = document.getElementById(id)
        this.dropdown.addEventListener('click', this.toggle)

        if (defaultOption == undefined) {
            defaultOption = Object.entries(options)[0][0]
        }

        this.text = this.dropdown.querySelector('.dropdown__text')
        this.text.innerText = options[defaultOption].title

        this.container = this.dropdown.querySelector('.dropdown__container')
        this.container.addEventListener('click', this.optionClick)

        this.options = options
        for (const [option, { title }] of Object.entries(options)) {
            this.container.appendChild(
                getElement(
                    'span',
                    { class: 'dropdown__item', __option: option },
                    [document.createTextNode(title)]
                )
            )
        }

        // make dropdown resize on window resize
        window.addEventListener('resize', this.resize)
        // make dropdown close when user clicks outside the window
        document.addEventListener('click', this.disappear)
    }

    // align dropdown to be centered under the icon + dropdown button
    resize = () => {
        // dont align if element is hidden
        if (this.container.classList.contains('hidden')) {
            return
        }

        const bounds = this.dropdown.parentNode.getBoundingClientRect()

        this.container.style.top = window.scrollY + bounds.bottom + 4 + 'px'
        this.container.style.left =
            bounds.left +
            bounds.width / 2 -
            this.container.getBoundingClientRect().width / 2 +
            'px'
    }

    // toggles whether the content of the dropdown is shown or not
    toggle = () => {
        this.container.classList.toggle('hidden')
        this.resize()
    }

    // handles the case where an user selects an item from the dropdown
    optionClick = (ev) => {
        if (ev.target.classList.contains('dropdown__item')) {
            const option = this.options[ev.target.getAttribute('__option')]
            this.text.innerText = option.title
            this.cb(option)
        }
    }

    // this is attached to document.onclick and is used to check if the user did not
    // click the container so to make it disappear
    disappear = (ev) => {
        if (
            !this.container.classList.contains('hidden') &&
            !this.dropdown.contains(ev.target)
        ) {
            this.container.classList.add('hidden')
        }
    }
}
