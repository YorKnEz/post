export const initTheme = () => {
    const theme = localStorage.getItem('theme')

    if (!theme) {
        localStorage.setItem('theme', 'light')
    }

    if (theme == 'dark') {
        document.documentElement.classList.toggle('theme-dark')
    }
}

export const toggleTheme = () => {
    // assume init has been called
    const theme = localStorage.getItem('theme')
    localStorage.setItem('theme', theme == 'dark' ? 'light' : 'dark')
    document.documentElement.classList.toggle('theme-dark')
}
