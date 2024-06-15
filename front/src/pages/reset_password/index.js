import { Form, Navbar, Search } from '../../components/index.js'

window.navbar = new Navbar()
window.searchBar = new Search()

window.onresize = () => {
    navbar.copySearchInput()
}

window.form = new Form(
    'form',
    ['email', 'password', 'confirmPassword'],
    (data, setError) => {
        if (data.password == 'test') {
            setError('Your password is too weak')
            return
        }

        console.log(data)
    }
)
