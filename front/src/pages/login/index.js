import { Form, Navbar, Search } from '../../components/index.js'
import env from '../../env.js'
import { getErrorMessage, success } from '../../utils/index.js'

window.navbar = new Navbar()
window.searchBar = new Search()

window.onresize = () => {
    window.navbar.copySearchInput()
}

window.form = new Form(
    'form',
    ['identifier', 'password'],
    async (data, setError) => {
        try {
            const response = await fetch(`${env.API_URL}/auth/login`, {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify(data),
            })

            const json = await response.json()

            if (!success(response.status)) {
                throw json
            }

            // navigate to home after being logged in
            location.assign('/')
        } catch (e) {
            setError(getErrorMessage(e))
        }
    }
)
