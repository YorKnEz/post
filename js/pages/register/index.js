import { Form } from '../../components/form.js'
import { Navbar } from '../../components/nav.js'
import { Search } from '../../components/search.js'

window.navbar = new Navbar()
window.searchBar = new Search()

window.onresize = () => {
    navbar.copySearchInput()
}

window.form = new Form(
    [
        'firstName',
        'lastName',
        'nickname',
        'email',
        'password',
        'confirmPassword',
    ],
    (data, setError) => {
        if (data.password != data.confirmPassword) {
            setError('Passwords are not the same')
            return
        }

        console.log(data)
    }
)
