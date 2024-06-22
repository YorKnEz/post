import { Navbar, Search } from '../../components/index.js'
import env from '../../env.js'

console.log(env.TEST)

window.navbar = new Navbar()

window.onresize = () => {
    window.navbar.resize()
}
