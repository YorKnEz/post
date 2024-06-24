import { AlbumCard } from "./albumCard.js";
import { PoemCard } from "./poemCard.js";

export class PostCard {
    constructor(data, type, small) {
        this.inner =
            data.type == 'album'
                ? new AlbumCard(data, type, small).inner
                : new PoemCard(data, type, small).inner
    }
}
