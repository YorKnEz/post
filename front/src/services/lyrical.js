import { __fetch } from './index.js'
import env from '../env.js'

const API_URL = env.LYRICAL_SERVICE_API_URL

// posts stuff
export const getPosts = async (data) => {
    return await __fetch(
        `${API_URL}/posts?query=${data.query ?? ''}&start=${data.start}&count=${data.count}&sort=${data.sort}&order=${data.order}`,
        { method: 'GET' }
    )
}

export const getContributions = async (data) => {
    return await __fetch(
        `${API_URL}/users/${data.id}/contributions?start=${data.start}&count=${data.count}&type=${data.type}`,
        { method: 'GET' }
    )
}

export const getReaction = async (id) => {
    return await __fetch(`${API_URL}/posts/${id}/reaction`, {
        method: 'POST',
        credentials: 'include',
    })
}

export const addReaction = async (id, data) => {
    return await __fetch(`${API_URL}/posts/${id}/reactions`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(data),
    })
}

// albums
export const getAlbums = async (data) => {
    return await __fetch(
        `${API_URL}/albums?query=${data.query ?? ''}&start=${data.start}&count=${data.count}&sort=${data.sort}&order=${data.order}`,
        { method: 'GET' }
    )
}

export const getAlbumsSuggestions = async (query) => {
    return (
        await __fetch(`${API_URL}/albums/suggestions?query=${query}`, {
            method: 'GET',
        })
    ).map((album) => ({ id: album.id, value: album.title }))
}

export const addPoemToAlbum = async (albumId, poemId) => {
    return await __fetch(`${API_URL}/albums/${albumId}/poems`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ poemId }),
    })
}

export const addAlbum = async (data) => {
    return await __fetch(`${API_URL}/albums`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(data),
    })
}

export const getAlbum = async (id) => {
    return await __fetch(`${API_URL}/albums/${id}`, { method: 'GET' })
}

export const deleteAlbum = async (id) => {
    return await __fetch(`${API_URL}/albums/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    })
}

// poems
export const getPoem = async (id) => {
    return await __fetch(`${API_URL}/poems/${id}`, { method: 'GET' })
}

export const getPoems = async (data) => {
    return await __fetch(
        `${API_URL}/poems?query=${data.query ?? ''}&start=${data.start}&count=${data.count}&sort=${data.sort}&order=${data.order}`,
        { method: 'GET' }
    )
}

export const getPoemsSuggestions = async (query) => {
    return (
        await __fetch(`${API_URL}/poems/suggestions?query=${query}`, {
            method: 'GET',
        })
    ).map((poem) => ({ id: poem.id, value: poem.title }))
}

export const addPoem = async (data) => {
    return await __fetch(`${API_URL}/poems`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(data),
    })
}

export const getPoemTranslations = async (id) => {
    return (
        await __fetch(`${API_URL}/poems/${id}/translations`, {
            method: 'GET',
        })
    ).reduce((obj, t) => {
        obj[t.id] = { title: t.language, value: t.id }
        return obj
    }, {})
}

export const addPoemTranslation = async (id, data) => {
    return await __fetch(`${API_URL}/poems/${id}/translations`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(data),
    })
}

export const updatePoem = async (id, data) => {
    return await __fetch(`${API_URL}/poems/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify(data),
    })
}

export const addPoemAnnotation = async (id, data) => {
    return await __fetch(`${API_URL}/poems/${id}/annotations`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(data),
    })
}

export const deletePoem = async (id) => {
    return await __fetch(`${API_URL}/poems/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    })
}

// annotations
export const getAnnotations = async (data) => {
    return await __fetch(
        `${API_URL}/annotations?start=${data.start}&count=${data.count}`,
        { method: 'GET' }
    )
}

export const getAnnotation = async (id) => {
    return await __fetch(`${API_URL}/annotations/${id}`, { method: 'GET' })
}

export const updateAnnotation = async (id, content) => {
    return await __fetch(`${API_URL}/annotations/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify({ content }),
    })
}

export const deleteAnnotation = async (id) => {
    return await __fetch(`${API_URL}/annotations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    })
}
