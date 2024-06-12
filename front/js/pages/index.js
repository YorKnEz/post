import { Navbar } from '../components/nav.js'
import { Search } from '../components/search.js'
import env from '../env.js'

console.log(env.TEST)

window.navbar = new Navbar()
window.searchBar = new Search()

window.onresize = () => {
    navbar.copySearchInput()
}
