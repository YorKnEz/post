import { Form, Navbar, Search } from '../../components/index.js'
import env from '../../env.js'

window.navbar = new Navbar()
window.searchBar = new Search()

window.onresize = () => {
    window.navbar.copySearchInput()
}

window.form = new Form(['nickname', 'password'], async (data, setError) => {
    try {
        const response = await fetch(`${env.API_URL}/auth/login`, {
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
})
