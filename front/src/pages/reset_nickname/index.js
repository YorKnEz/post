import { Form, Modal, Navbar } from '../../components/index.js'
import { changeNickname } from '../../services/index.js'
import { getErrorMessage } from '../../utils/api.js'

window.navbar = new Navbar()
window.modal = new Modal('modal', () => {
    // navigate to login page when modal is closed
    location.assign('/login')
})

window.form = new Form('form', ['nickname'], async (data, setError) => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    try {
        await changeNickname({ nickname: data.nickname, token })

        window.modal.setContent(
            document.createTextNode(
                `You changed your nickname to ${data.nickname}. You may now close this menu.`
            )
        )

        window.modal.open()
    } catch (e) {
        setError(getErrorMessage(e))
    }
})
