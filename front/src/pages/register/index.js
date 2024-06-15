import { Form, Modal, Navbar, Search } from '../../components/index.js'
import env from '../../env.js'
import { getErrorMessage, success } from '../../utils/index.js'

window.navbar = new Navbar()
window.searchBar = new Search()
window.modal = new Modal('modal', () => {
    // navigate to login page when modal is closed
    location.assign('/login')
})

window.onresize = () => {
    window.navbar.copySearchInput()
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

        try {
            const response = await fetch(`${env.API_URL}/auth/register`, {
                method: 'POST',
                body: JSON.stringify(data),
            })

            const json = await response.json()

            if (!success(response.status)) {
                throw json
            }

            window.modal.open()
        } catch (e) {
            setError(getErrorMessage(e))
        }
    }
)
