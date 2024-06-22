import { Navbar, Dropdown } from '../../components/index.js'

window.navbar = new Navbar()
window.dropdown = new Dropdown('dropdown')

window.onresize = () => {
    window.navbar.resize()
}
