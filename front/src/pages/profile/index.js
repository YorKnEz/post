import { Navbar, Search, Dropdown } from '../../components/index.js'

window.navbar = new Navbar()
window.searchBar = new Search()
window.dropdown = new Dropdown('dropdown')

window.onresize = () => {
    navbar.copySearchInput()
}
