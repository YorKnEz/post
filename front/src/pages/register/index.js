import { Form, Modal, Navbar } from '../../components/index.js'
import { register } from '../../services/index.js'
import { getErrorMessage } from '../../utils/index.js'

window.navbar = new Navbar()
window.modal = new Modal('modal', () => {
    // navigate to login page when modal is closed
    location.assign('/login')
})

window.onresize = () => {
    window.navbar.resize()
}

window.form = new Form(
    'form',
    [
        'firstName',
        'lastName',
        'nickname',
        'email',
        'password',
        'confirmPassword',
    ],
    async (data, setError) => {
        if (data.password != data.confirmPassword) {
            setError('Passwords are not the same')
            return
        }

        delete data.confirmPassword

        try {
            await register(data)

            window.modal.open()
        } catch (e) {
            setError(getErrorMessage(e))
        }
    }
)
