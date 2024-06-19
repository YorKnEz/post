export const albumSchema = {
    authorId: {},
    title: {
        min: 4,
        max: 256,
    },
    publicationDate: {
        optional: true,
    }, // TODO: validate?
}

export const albumUpdateSchema = {
    title: {
        min: 4,
        max: 256,
        optional: true,
    },
    publicationDate: {
        optional: true,
    }, // TODO: validate?
}

export const albumAddPoemSchema = {
    poemId: {},
}

export const annotationSchema = {
    lyricsId: {},
    content: {
        min: 16,
        max: 32678,
    },
    offset: {},
    length: {},
}

export const annotationUpdateSchema = {
    content: {
        min: 16,
        max: 32678,
    },
}
