import {
    Navbar,
    Search,
    SuggestionInput,
    Form,
} from '../../components/index.js'

window.navbar = new Navbar()
window.searchBar = new Search()

window.onresize = () => {
    navbar.copySearchInput()
}

window.byInput = new SuggestionInput('by', 'by-suggestions')
window.albumInput = new SuggestionInput('album', 'album-suggestions')

document.onclick = (ev) => {
    byInput.disappear(ev)
    albumInput.disappear(ev)
}

window.form = new Form(
    'form',
    ['by', 'title', 'language', 'lyrics', 'date', 'album'],
    (data, setError) => {
        console.log(data)
    }
)
