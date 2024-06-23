import { Loader, Navbar } from '../../components/index.js'
import { verify } from '../../services/index.js'
import { getElement, getErrorMessage } from '../../utils/index.js'

window.navbar = new Navbar()

const loader = new Loader('verify-message')

window.onload = async () => {
    const content = loader.getContent()

    try {
        const params = new URLSearchParams(location.search)
        const token = params.get('token')
        await verify(token)

        content.appendChild(
            getElement('h1', {}, [document.createTextNode('Account verified')])
        )
        content.appendChild(
            getElement('span', {}, [
                document.createTextNode(
                    'Your account has been successfully verified, you may now go to the login page.'
                ),
            ])
        )
    } catch (e) {
        content.appendChild(
            getElement('h1', {}, [document.createTextNode('Error encountered')])
        )
        content.appendChild(
            getElement('span', {}, [
                document.createTextNode(getErrorMessage(e)),
            ])
        )
    }

    loader.loaded()
}
