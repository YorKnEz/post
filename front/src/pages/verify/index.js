import { Loader, Navbar } from '../../components/index.js'
import env from '../../env.js'
import { getElement, getErrorMessage, success } from '../../utils/index.js'

window.navbar = new Navbar()

window.onresize = () => {
    window.navbar.resize()
}

const loader = new Loader('verify-message')

window.onload = async () => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    const content = loader.getContent()

    try {
        const response = await fetch(
            `${env.AUTH_SERVICE_API_URL}/auth/verify?token=${token}`,
            {
                method: 'POST',
            }
        )
        await new Promise((res) => setTimeout(res, 2000))

        const json = await response.json()

        if (!success(response.status)) {
            throw json
        }

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
