import { Form, Modal, Navbar } from '../../components/index.js'
import { register, uploadImage } from '../../services/index.js'
import { getErrorMessage } from '../../utils/index.js'

window.navbar = new Navbar()
window.modal = new Modal('modal', () => {
    // navigate to login page when modal is closed
    location.assign('/login')
})

window.form = new Form(
    'form',
    [
        'firstName',
        'lastName',
        'nickname',
        'avatar',
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
            // upload the image to the server
            const formData = new FormData()
            formData.append('image', data.avatar)

            const { url } = await uploadImage(formData)

            data.avatar = url // overwrite the file with it's url from the server

            await register(data)

            window.modal.open()
        } catch (e) {
            setError(getErrorMessage(e))
        }
    }
)
