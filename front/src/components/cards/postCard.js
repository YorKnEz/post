import { AlbumCard, PoemCard } from './index.js'

export class PostCard {
    constructor(data, type, small) {
        this.inner =
            data.type == 'album'
                ? new AlbumCard(data, type, small).inner
                : new PoemCard(data, type, small).inner
    }
}
