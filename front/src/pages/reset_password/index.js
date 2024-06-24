import { Form, Modal, Navbar } from '../../components/index.js'
import { changePassword } from '../../services/index.js'

window.navbar = new Navbar()
window.modal = new Modal('modal', () => {
    // navigate to login page when modal is closed
    location.assign('/login')
})

window.form = new Form(
    'form',
    { password: {}, confirmPassword: {} },
    async (data, setError) => {
        if (data.password != data.confirmPassword) {
            setError('Passwords are not the same')
            return
        }

        const params = new URLSearchParams(location.search)
        const token = params.get('token')

        try {
            await changePassword({ password: data.password, token })

            window.modal.open()
        } catch (e) {
            setError(getErrorMessage(e))
        }
    }
)
