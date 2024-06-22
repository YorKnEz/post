import { Navbar } from '../../components/index.js'

window.navbar = new Navbar()

window.onresize = () => {
    window.navbar.resize()
}
