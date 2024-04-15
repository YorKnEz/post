import { Navbar } from '../../components/nav.js'
import { Search } from '../../components/search.js'
import { Dropdown } from '../../components/dropdown.js'

window.navbar = new Navbar()
window.searchBar = new Search()
window.dropdown = new Dropdown('dropdown')

window.onresize = () => {
    navbar.copySearchInput()
}
