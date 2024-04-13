const toggleMenu = () => {
    const sidebar = document.getElementById('sidebar')
    const sidebarRect = sidebar.getBoundingClientRect()

    if (sidebarRect.left != 0) {
        sidebar.style.left = '0px'
    } else {
        sidebar.style.left = '-300px'
    }
}

const addPoem = () => {
    console.log('Pressed add Poem')
}

const showRss = () => {
    console.log('Pressed rss')
}

const changeTheme = () => {
    console.log('Pressed change theme')
}

// const moveElement = (id, newGridCol, oldGridCol, navPoz, sidePoz, limit) => {
//     const mvElement = document.getElementById(id)
//     const navbar = document.getElementById('navbar')
//     const sidebar = document.getElementById('sidebar')

//     if (window.innerWidth <= limit) {
//         // Remove from navbar and append to sidebar
//         if (navbar.contains(mvElement)) {
//             navbar.removeChild(mvElement)
//             navbar.style.gridTemplateColumns = newGridCol
//         }
//         if (!sidebar.contains(mvElement)) {
//             //mvElement.classList.toggle("sidebar__item")
//             sidebar.insertBefore(mvElement, sidebar.childNodes[2 * sidePoz])
//         }
//     } else {
//         // Remove from sidebar and append to navbar
//         if (sidebar.contains(mvElement)) {
//             sidebar.removeChild(mvElement)
//             //mvElement.classList.toggle("sidebar__item")
//         }
//         if (!navbar.contains(mvElement)) {
//             navbar.style.gridTemplateColumns = oldGridCol
//             navbar.insertBefore(mvElement, navbar.childNodes[2 * navPoz])
//         }
//     }
// }

// const forResize = () => {
//     moveElement('search', '50% 50%', '30% 40% 30%', 1, 1, 599)
//     moveElement('buttons', '100%', '50% 50%', 1, 3, 300)
// }

// forResize()
// window.onresize = forResize
