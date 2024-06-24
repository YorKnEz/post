export const getElement = (element, attributes = {}, children = []) => {
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

        elem.appendChild(child)
    }

    return elem
}
