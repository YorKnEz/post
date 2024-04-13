const search = () => {
    const searchInput = Array.from(document.getElementsByClassName('search'))
        .filter((element) => window.getComputedStyle(element).display != 'none')[0]
        .querySelector('.search__input')

    //const searchInput = document.getElementById('searchInput')

    console.log(searchInput.value)
}

const handleKeyDown = (event) => {
    if (event.keyCode === 13) {
        //enter was pressed
        search()
    }
}
