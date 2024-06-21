export const albumSchema = {
    authorId: {
        type: 'int',
    },
    title: {
        min: 4,
        max: 256,
    },
    publicationDate: {
        type: 'date',
        optional: true,
    },
}

export const albumUpdateSchema = {
    title: {
        min: 4,
        max: 256,
        optional: true,
    },
    publicationDate: {
        type: 'date',
        optional: true,
    },
}

export const albumAddPoemSchema = {
    poemId: {
        type: 'int',
    },
}

export const poemSchema = {
    authorId: {
        type: 'int',
        optional: true,
    },
    poemId: {
        type: 'int',
        optional: true,
    },
    language: {},
    title: {
        min: 4,
        max: 256,
    },
    publicationDate: {
        type: 'date',
        optional: true,
    },
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
        type: 'date',
        optional: true,
    },
    content: {
        min: 16,
        max: 32678,
        optional: true,
    },
}

export const annotationSchema = {
    content: {
        min: 16,
        max: 32678,
    },
    offset: {
        type: 'int',
    },
    length: {
        type: 'int',
    },
}

export const annotationUpdateSchema = {
    content: {
        min: 16,
        max: 32678,
    },
}

export const reactionSchema = {
    action: {
        type: 'int',
        in: [-1, 1],
    },
    type: {
        type: 'int',
        in: [0, 1],
    },
}
