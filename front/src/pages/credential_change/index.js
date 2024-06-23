import { Form, Modal, Navbar } from '../../components/index.js'
import { requestChange } from '../../services/index.js'

window.navbar = new Navbar()
window.modal = new Modal('modal', () => {
    // navigate to login page when modal is closed
    location.assign('/login')
})

window.form = new Form(
    'form',
    { type: {}, email: {} },
    async (data, setError) => {
        try {
            await requestChange(data)

            window.modal.open()
        } catch (e) {
            setError(getErrorMessage(e))
        }
    }
)
