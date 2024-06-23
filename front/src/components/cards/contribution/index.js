import { AlbumCard } from './albumCard.js'
import { AnnotationCard } from './annotationCard.js'
import { PoemCard } from './poemCard.js'

export class ContributionCard {
    constructor(user, data) {
        if (data.type == 'album') {
            this.inner = new AlbumCard(user, data).inner
        } else if (data.type == 'annotation') {
            this.inner = new AnnotationCard(user, data).inner
        } else if (data.type == 'poem') {
            this.inner = new PoemCard(user, data).inner
        }
    }
}
