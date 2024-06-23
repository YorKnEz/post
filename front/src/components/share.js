import { getElement } from '../utils/index.js'

export class Share {
    constructor(title, url) {
        this.url = url

        this.inner = getElement('section', { class: 'share' }, [
            getElement('h2', { class: 'share__title' }, [
                document.createTextNode(title),
            ]),
            getElement('div', { class: 'share__buttons' }, [
                getElement(
                    'button',
                    {
                        class: 'btn btn--round btn--span btn--transparent',
                        onclick: this.share('tumblr'),
                    },
                    [
                        getElement('i', {
                            class: 'fa-brands fa-tumblr btn__icon',
                        }),
                    ]
                ),
                getElement(
                    'button',
                    {
                        class: 'btn btn--round btn--span btn--transparent',
                        onclick: this.share('wordpress'),
                    },
                    [
                        getElement('i', {
                            class: 'fa-brands fa-wordpress btn__icon',
                        }),
                    ]
                ),
            ]),
            getElement('div', { class: 'share__row' }, [
                getElement('span', { class: 'share__label' }, [
                    document.createTextNode('Share URL'),
                ]),
                getElement('input', {
                    class: 'input share__input',
                    disabled: '',
                    value: this.url,
                }),
                getElement(
                    'button',
                    {
                        class: 'btn btn--round btn--transparent',
                        onclick: this.copy,
                    },
                    [document.createTextNode('Copy')]
                ),
            ]),
        ])
    }

    shown = () => {
        return !this.inner.classList.contains('hidden')
    }

    toggle = () => {
        this.inner.classList.toggle('hidden')
    }

    share = (to) => {
        console.log(`share to ${to}`)
    }

    copy = (ev) => {
        navigator.clipboard.writeText(ev.target.previousElementSibling.value)
    }
}
