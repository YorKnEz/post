import { Navbar, SuggestionInput, Form } from '../../components/index.js'
import {
    addPoem,
    addPoemToAlbum,
    addPoemTranslation,
    getAlbumsSuggestions,
    getPoemsSuggestions,
    getUsersSuggestions,
    uploadImage,
} from '../../services/index.js'
import { getErrorMessage } from '../../utils/index.js'

window.navbar = new Navbar()

let album
const albumInput = new SuggestionInput(
    'album',
    'album-suggestions',
    getAlbumsSuggestions,
    (option) => (album = option)
)

let poem
const poemInput = new SuggestionInput(
    'poem',
    'poem-suggestions',
    getPoemsSuggestions,
    (option) => (poem = option)
)

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
        album: { required: false },
        poem: { required: false },
        by: { required: false },
        language: {},
        cover: {},
        title: {},
        date: {},
        about: {},
        lyrics: {},
    },
    async (data, setError) => {
        try {
            const formData = new FormData()
            formData.append('image', data.cover)

            const { url } = await uploadImage(formData)

            const poemData = {
                language: data.language,
                cover: url,
                title: data.title,
                publicationDate: data.date,
                about: data.about,
                content: data.lyrics,
            }

            if (data.by) {
                poemData.authorId = author.id
            }

            const response = data.poem
                ? await addPoemTranslation(poem.id, poemData)
                : await addPoem(poemData)

            if (data.album) {
                await addPoemToAlbum(album.id, response.id)
            }

            location.assign(`/poem/${response.id}`)
        } catch (e) {
            setError(getErrorMessage(e))
        }
    }
)
