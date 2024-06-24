import { getAnnotation, getReaction } from '../../services/index.js'
import { Annotation } from './component/index.js'

export class ViewAnnotation {
    constructor(component) {
        this.component = component
    }

    enter = async () => {
        try {
            const data = await getAnnotation(this.component.annotation.id)
            const reaction = await getReaction(this.component.annotation.id)

            data.liked = reaction.type == 0
            data.disliked = reaction.type == 1

            this.component.annotation.element.classList.toggle(
                'poem__annotated--active'
            )

            new Annotation(
                data,
                this.component.poem,
                this.cancel,
                (newInner) => {
                    this.inner = newInner

                    this.component.inner.replaceWith(this.inner)
                    this.component.inner = this.inner

                    location.hash = this.component.annotation.id
                    this.component.align(this.component.annotation.element)
                }
            )
        } catch (e) {
            console.error(e)
        }
    }

    exit = () => {
        this.component.annotation.element.classList.toggle(
            'poem__annotated--active'
        )
    }

    cancel = (ev) => {
        this.component.setState(this.component.emptyState)
    }
}
