import { solveRequest } from '../../../services/admin.js'
import { getElement } from '../../../utils/html.js'
import { AlbumCard } from './albumCard.js'
import { AnnotationCard } from './annotationCard.js'
import { PoemCard } from './poemCard.js'
import { UserCard } from './userCard.js'

export class RequestCard {
    constructor(data, type) {
        this.data = data

        if (type == 'album') {
            this.inner = new AlbumCard(this.data.album).inner
        } else if (type == 'annotation') {
            this.inner = new AnnotationCard(this.data.annotation).inner
        } else if (type == 'poem') {
            this.inner = new PoemCard(this.data.poem).inner
        } else if (type == 'user') {
            this.inner = new UserCard(this.data.user).inner
        }

        this.inner.append(
            getElement('div', { class: 'request-card__actions' }, [
                getElement(
                    'button',
                    { class: 'btn btn--span', onclick: () => this.solve(true) },
                    [
                        getElement('span', { class: 'btn__label' }, [
                            document.createTextNode('Approve'),
                        ]),
                    ]
                ),
                getElement(
                    'button',
                    {
                        class: 'btn btn--span',
                        onclick: () => this.solve(false),
                    },
                    [
                        getElement('span', { class: 'btn__label' }, [
                            document.createTextNode('Deny'),
                        ]),
                    ]
                ),
            ])
        )
    }

    solve = async (approve) => {
        try {
            await solveRequest(this.data.id, approve)

            // wait some time before removing card
            await new Promise((res) => setTimeout(res, 200))

            this.inner.remove()
        } catch (e) {
            console.error(e)
        }
    }
}
