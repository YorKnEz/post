export const getElement = (element, attributes = {}, children = []) => {
    const elem = document.createElement(element)
    for (const [attr, value] of Object.entries(attributes)) {
        elem.setAttribute(attr, value)
    }
    for (const child of children) {
        elem.appendChild(child)
    }
    return elem
}
