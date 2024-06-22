import { Navbar, SuggestionInput, Form } from '../../components/index.js'
import env from '../../env.js'
import { getErrorMessage, success } from '../../utils/api.js'

window.navbar = new Navbar()

window.onresize = () => {
    window.navbar.resize()
}

window.byInput = new SuggestionInput('by', 'by-suggestions')
window.albumInput = new SuggestionInput('album', 'album-suggestions')

document.onclick = (ev) => {
    byInput.disappear(ev)
    albumInput.disappear(ev)
}

window.form = new Form('form', ['cover'], async (data, setError) => {
    try {
        const formData = new FormData()
        formData.append('image', data.cover)

        const response = await fetch(`${env.IMAGE_SERVICE_API_URL}/images`, {
            method: 'POST',
            body: formData,
        })

        const json = await response.json()

        if (!success(response.status)) {
            throw json
        }

        console.log(response, json)
    } catch (e) {
        setError(getErrorMessage(e))
    }
})
