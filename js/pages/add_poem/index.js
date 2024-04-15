import { Form } from '../../components/form.js'
import { SuggestionInput } from '../../components/suggestionInput.js'
import { toggleTheme } from '../../utils.js'

window.toggleTheme = toggleTheme

window.byInput = new SuggestionInput('by', 'by-suggestions')
window.albumInput = new SuggestionInput('album', 'album-suggestions')

document.onclick = (ev) => {
    byInput.disappear(ev)
    albumInput.disappear(ev)
}

window.form = new Form(['by', 'title', 'lyrics', 'date', 'album'], (data, setError) => {
    console.log(data)
})
