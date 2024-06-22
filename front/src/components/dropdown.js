export class Dropdown {
    constructor(id) {
        this.dropdown = document.getElementById(id)
        this.dropdownContainer = this.dropdown.querySelector(
            '.dropdown__container'
        )
        this.dropdownContainer.onclick = this.optionClick
    }

    // align dropdown to be centered under the icon + dropdown button
    align = () => {
        // dont align if element is hidden
        if (this.dropdownContainer.classList.contains('hidden')) {
            return
        }

        const bounds = this.dropdown.parentNode.getBoundingClientRect()

        this.dropdownContainer.style.top =
            window.scrollY + bounds.bottom + 4 + 'px'
        this.dropdownContainer.style.left =
            bounds.left +
            bounds.width / 2 -
            this.dropdownContainer.getBoundingClientRect().width / 2 +
            'px'
    }

    // toggles whether the content of the dropdown is shown or not
    toggle = () => {
        this.dropdownContainer.classList.toggle('hidden')
        this.align()
    }

    // handles the case where an user selects an item from the dropdown
    optionClick = (ev) => {
        if (ev.target.classList.contains('dropdown__item')) {
            console.log(ev.target.innerText)
        }
    }

    // this is attached to document.onclick and is used to check if the user did not
    // click the container so to make it disappear
    disappear = (ev) => {
        if (
            !this.dropdownContainer.classList.contains('hidden') &&
            !this.dropdown.contains(ev.target)
        ) {
            this.dropdownContainer.classList.add('hidden')
        }
    }
}
