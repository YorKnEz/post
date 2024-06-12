import { Navbar } from '../../components/nav.js'
import { Search } from '../../components/search.js'

window.navbar = new Navbar()
window.searchBar = new Search()

window.onresize = () => {
    navbar.copySearchInput()
}