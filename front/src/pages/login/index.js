import { Form, Navbar } from '../../components/index.js'
import { login } from '../../services/index.js'
import { getErrorMessage } from '../../utils/index.js'

window.navbar = new Navbar()

window.form = new Form(
    'form',
    ['identifier', 'password'],
    async (data, setError) => {
        try {
            const user = await login(data)

            localStorage.setItem('user', JSON.stringify(user))

            // navigate to home after being logged in
            location.assign('/')
        } catch (e) {
            setError(getErrorMessage(e))
        }
    }
)
