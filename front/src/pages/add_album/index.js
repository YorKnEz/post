import { Navbar, SuggestionInput, Form } from '../../components/index.js'
import {
    getUsersSuggestions,
    uploadImage,
    addAlbum,
} from '../../services/index.js'
import { getErrorMessage } from '../../utils/index.js'

window.navbar = new Navbar()

let author
const authorInput = new SuggestionInput(
    'by',
    'by-suggestions',
    getUsersSuggestions,
    (option) => (author = option)
)

window.form = new Form(
    'form',
    {
        by: { required: false },
        date: {},
        cover: {},
        title: {},
    },
    async (data, setError) => {
        try {
            const formData = new FormData()
            formData.append('image', data.cover)

            const { url } = await uploadImage(formData)

            const albumData = {
                cover: url,
                title: data.title,
                publicationDate: data.date,
            }

            if (data.by) {
                albumData.authorId = author?.id
            }

            const response = await addAlbum(albumData)

            location.assign(`/album/${response.id}`)
        } catch (e) {
            setError(getErrorMessage(e))
        }
    }
)

window.onload = () => {
    const user = sessionStorage.getItem('user')

    if (!user) {
        location.assign('/')
    }
}
