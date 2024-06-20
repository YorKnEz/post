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

export const poemSchema = {
    authorId: {
        optional: true,
    },
    title: {
        min: 4,
        max: 256,
    },
    publicationDate: {
        optional: true,
    },
    language: {},
    about: {
        min: 16,
        max: 32678,
    },
    content: {
        min: 16,
        max: 32678,
    },
}

export const poemUpdateSchema = {
    title: {
        min: 4,
        max: 256,
        optional: true,
    },
    publicationDate: {
        optional: true,
    }, // TODO: validate?
}

export const lyricsUpdateSchema = {
    content: {
        min: 16,
        max: 32678,
    },
}

export const annotationSchema = {
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
