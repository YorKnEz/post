export const albumSchema = {
    posterId: {},
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
    poemId: {}
}
