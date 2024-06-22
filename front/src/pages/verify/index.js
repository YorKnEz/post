import { Loader, Navbar } from '../../components/index.js'
import env from '../../env.js'
import { getErrorMessage, success } from '../../utils/index.js'

window.navbar = new Navbar()
window.loader = new Loader('loader')

window.onresize = () => {
    window.navbar.resize()
}

window.onload = async () => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    const verifyMessage = window.loader.getContent()
    const title = verifyMessage.getElementsByTagName('h1')[0]
    const content = verifyMessage.getElementsByTagName('p')[0]

    try {
        const response = await fetch(
            `${env.API_URL}/auth/verify?token=${token}`,
            {
                method: 'POST',
            }
        )

        const json = await response.json()

        if (!success(response.status)) {
            throw json
        }

        title.innerText = 'Account verified'
        content.innerText =
            'Your account has been successfully verified, you may now go to the login page.'
    } catch (e) {
        title.innerText = 'Error encountered'
        content.innerText = getErrorMessage(e)
    }

    window.loader.loaded()
}
