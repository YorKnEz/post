export class AnnotationsHandler {
    constructor() {
        this.annotations = {}

        for (const ann of document.getElementsByClassName('poem__annotated')) {
            const id = ann.id.replace('annotation-', '')
            this.annotations[id] = { element: ann }

            ann.addEventListener('click', () => {
                console.log('clicked on ', id)
            })
        }
    }
}
