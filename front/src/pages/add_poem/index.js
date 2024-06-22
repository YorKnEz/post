import { Navbar, SuggestionInput, Form } from '../../components/index.js'
import { uploadImage } from '../../services/index.js'
import { getErrorMessage } from '../../utils/index.js'

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

        const { url } = await uploadImage(formData)

        console.log(url)
    } catch (e) {
        setError(getErrorMessage(e))
    }
})
