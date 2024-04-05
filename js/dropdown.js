const dropdown = document.querySelector('#languages-dropdown')
const dropdownContainer = dropdown.querySelector('.dropdown__container')

dropdown.onclick = function (ev) {
    dropdownContainer.classList.toggle('dropdown__container--hidden')

    // align dropdown to be centered under the icon + dropdown button
    const bounds = dropdown.parentNode.getBoundingClientRect()
    console.log(bounds)
    dropdownContainer.style.top = window.scrollY + bounds.bottom + 4 + 'px'
    dropdownContainer.style.left =
        bounds.left +
        bounds.width / 2 -
        dropdownContainer.getBoundingClientRect().width / 2 +
        'px'
        console.log(dropdownContainer.style.left)
}
