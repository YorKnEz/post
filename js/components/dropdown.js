const dropdown = document.querySelector('#languages-dropdown')
const dropdownContainer = dropdown.querySelector('.dropdown__container')

// align dropdown to be centered under the icon + dropdown button
const alignDropdown = () => {
    // dont align if element is hidden
    if (dropdownContainer.classList.contains('hidden')) {
        return
    }

    const bounds = dropdown.parentNode.getBoundingClientRect()

    dropdownContainer.style.top = window.scrollY + bounds.bottom + 4 + 'px'
    dropdownContainer.style.left =
        bounds.left +
        bounds.width / 2 -
        dropdownContainer.getBoundingClientRect().width / 2 +
        'px'
}

// toggles whether the content of the dropdown is shown or not
const toggleDropdown = () => {
    dropdownContainer.classList.toggle('hidden')
    alignDropdown()
}

// handles the case where an user selects an item from the dropdown
const handleDropdownOptionClick = (ev) => {
    if (ev.target.classList.contains('dropdown__item')) {
        console.log(ev.target.innerText)
    }
}

// this is attached to document.onclick and is used to check if the user did not
// click the container so to make it disappear
const handleDropdownDisappear = (ev) => {
    if (
        !dropdownContainer.classList.contains('hidden') &&
        !dropdown.contains(ev.target)
    ) {
        dropdownContainer.classList.add('hidden')
    }
}

dropdown.onclick = toggleDropdown

dropdownContainer.onclick = handleDropdownOptionClick
