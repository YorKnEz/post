export const getElement = (
    element,
    attributes = {},
    children = [],
    clone = false
) => {
    const elem = document.createElement(element)
    for (const [attr, value] of Object.entries(attributes)) {
        if (attr == 'onclick') {
            elem.addEventListener('click', value)
            continue
        }

        elem.setAttribute(attr, value)
    }
    for (const child of children) {
        if (!child) {
            continue
        }

        if (clone) {
            elem.appendChild(child.cloneNode(true))
        } else {
            elem.appendChild(child)
        }
    }
    return elem
}
