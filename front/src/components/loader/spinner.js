import { getElement } from '../../utils/index.js'

export class Spinner {
    constructor() {
        this.inner = getElement('div', { class: 'spinner__container' }, [
            getElement('div', { class: 'spinner' }),
        ])
    }
}
