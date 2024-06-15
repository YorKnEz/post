// Wraps a component that must wait for a response and displays a loading message/component
// while the response is gathered
//
// In html it must be used like this:
// <div id="`id`">
//   <div>...Loading thing...</div>
//   <div>...Actual content...</div>
// </div>
//
// Upon loading the content, the user of this class calls `loaded()` in order to display it
// TODO: style loader
export class Loader {
    constructor(id) {
        this.loader = document.getElementById(id)
        // get children
        this.loading = this.loader.children[0]
        this.content = this.loader.children[1]
        // remove actual content
        this.loader.removeChild(this.content)
    }

    // gives out a copy of the content for modification through js
    getContent = () => this.content

    // reveal the content upon calling this method
    loaded = () => {
        this.loader.removeChild(this.loading)
        this.loader.appendChild(this.content)
    }
}
