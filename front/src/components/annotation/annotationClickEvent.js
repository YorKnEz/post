export class AnnotationClickEvent extends Event {
    constructor(annotation) {
        super('annotation')
        this.annotation = annotation
    }
}