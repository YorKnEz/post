import { Form, Navbar } from '../../components/index.js'

window.navbar = new Navbar()

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
