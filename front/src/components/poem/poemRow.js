import { getElement } from '../../utils/index.js'

export class PoemRow {
    constructor(index, poem) {
        this.row = getElement(
            'a',
            {
                class: 'table__row table__row--poem-chart',
                href: `/poem/${poem.id}`,
            },
            [
                getElement('div', {}, [document.createTextNode(index)]),
                getElement('div', { class: 'poem-row' }, [
                    getElement('img', {
                        class: 'poem-row__image',
                        src: poem.cover,
                        alt: `cover of ${poem.title}`,
                    }),
                    getElement('div', { class: 'poem-row__info' }, [
                        getElement('span', { class: 'poem-row__text' }, [
                            document.createTextNode(poem.title),
                        ]),
                    ]),
                ]),
                getElement('div', { class: 'poem-row__text' }, [
                    document.createTextNode(poem.likes),
                ]),
                getElement('div', { class: 'poem-row__text' }, [
                    document.createTextNode(poem.contributors),
                ]),
            ]
        )
    }
}
