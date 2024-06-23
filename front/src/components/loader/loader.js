import { getElement } from '../../utils/index.js'
import { Spinner } from './spinner.js'

// Wraps a component that must wait for a response and displays a loading message/component
// while the response is gathered
//
// In order to use it, pass the id of the html component that can't be displayed yet and the loader
// will replace it with a loading component. Upon loading the content, the user of this class calls
// `loaded()` in order to display it
// TODO: make loader more fancy
export class Loader {
    constructor(id, customLoader = new Spinner().inner) {
        // this.loader = getElement('div', { class: 'loader' }, [
        //     document.createTextNode('Loading...'),
        // ])
        this.loader = customLoader
        this.content = document.getElementById(id)
        document.getElementById(id).replaceWith(this.loader)
    }

    getContent = () => this.content

    // reveal the content upon calling this method
    loaded = () => {
        this.loader.replaceWith(this.content)
    }
}
