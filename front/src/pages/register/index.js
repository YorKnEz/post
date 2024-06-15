import { Form, Navbar, Search } from '../../components/index.js'

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
