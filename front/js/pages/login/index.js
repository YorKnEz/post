import { Form } from '../../components/form.js'
import { Navbar } from '../../components/nav.js'
import { Search } from '../../components/search.js'

window.navbar = new Navbar()
window.searchBar = new Search()

window.onresize = () => {
    navbar.copySearchInput()
}

window.form = new Form(['nickname', 'password'], (data, setError) => {
    if (data.password == 'test') {
        setError('Your password is too weak')
        return
    }

    console.log(data)
})
