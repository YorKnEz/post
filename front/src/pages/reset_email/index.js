import { Form, Modal, Navbar } from '../../components/index.js'
import { changeEmail } from '../../services/index.js'
import { getErrorMessage } from '../../utils/api.js'

window.navbar = new Navbar()
window.modal = new Modal('modal', () => {
    // navigate to login page when modal is closed
    location.assign('/login')
})

window.form = new Form('form', { email: {} }, async (data, setError) => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    try {
        await changeEmail({ email: data.email, token })

        window.modal.setContent(
            document.createTextNode(
                `You will receive a confirmation email to ${data.email}. Your email is not changed yet. You may now close this menu.`
            )
        )

        window.modal.open()
    } catch (e) {
        setError(getErrorMessage(e))
    }
})
