import {
    deleteUser,
    deleteAlbum,
    deleteAnnotation,
    deletePoem,
} from '../../../services/index.js'
import { getElement } from '../../../utils/index.js'
import { AlbumCard } from './albumCard.js'
import { AnnotationCard } from './annotationCard.js'
import { PoemCard } from './poemCard.js'
import { UserCard } from './userCard.js'

export class DeleteCard {
    static methods = {
        user: deleteUser,
        album: deleteAlbum,
        poem: deletePoem,
        annotation: deleteAnnotation,
    }

    constructor(data, type) {
        this.data = data

        if (type == 'album') {
            this.inner = new AlbumCard(this.data, true).inner
        } else if (type == 'annotation') {
            this.inner = new AnnotationCard(this.data, true).inner
        } else if (type == 'poem') {
            this.inner = new PoemCard(this.data, true).inner
        } else if (type == 'user') {
            this.inner = new UserCard(this.data, true).inner
        }

        this.inner.append(
            getElement('div', { class: 'request-card__actions' }, [
                getElement(
                    'button',
                    {
                        class: 'btn btn--span',
                        onclick: () => this.delete(type),
                    },
                    [
                        getElement('i', { class: 'fa-solid fa-trash' }),
                        getElement('span', { class: 'btn__label' }, [
                            document.createTextNode('Delete'),
                        ]),
                    ]
                ),
            ])
        )
    }

    delete = async (type) => {
        try {
            await DeleteCard.methods[type](this.data.id)

            // wait some time before removing card
            await new Promise((res) => setTimeout(res, 200))

            this.inner.remove()
        } catch (e) {
            console.error(e)
        }
    }
}
