export const albumSchema = {
    posterId: {},
    authorId: {},
    title: {
        min: 4,
        max: 256,
    },
    publicationDate: {}, // TODO: validate?
}
