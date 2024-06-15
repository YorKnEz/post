export * from './api.js'

export const toggleTheme = () => {
    document.documentElement.classList.toggle('theme-dark')
}

// make a textarea resize based on its content
export const autoGrow = (oField) => {
    if (oField.scrollHeight > oField.clientHeight && oField.clientHeight) {
        oField.style.height = `${oField.scrollHeight}px`
    }
}

// turns html (lyrics, annotations) to raw text
export const htmlToText = (html) => {
    return html
        .split('\n')
        .map((line) => line.trim())
        .join('')
        .replace(/(<br>)/gi, '\n')
        .replace(/(<([^>]+)>)/gi, '')
}

// scrolls to specified element taking into account the navbar
export const scrollToElem = (elem) => {
    window.scroll(
        window.scrollX,
        window.scrollY +
            Math.ceil(elem.getBoundingClientRect().y) -
            document.getElementById('nav').getBoundingClientRect().height
    )
}

// removes the hash from location without switching page
export const removeHashFromURL = () => {
    const url = window.location.toString()

    if (url.indexOf('#') > 0) {
        window.history.replaceState(
            {},
            document.title,
            url.substring(0, url.indexOf('#'))
        )
    }
}
