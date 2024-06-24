import { getElement } from '../utils/index.js'

export class Share {
    constructor(title, data) {
        this.data = data

        this.inner = getElement('section', { class: 'share' }, [
            getElement('h2', { class: 'share__title' }, [
                document.createTextNode(title),
            ]),
            getElement('div', { class: 'share__buttons' }, [
                getElement(
                    'button',
                    {
                        class: 'btn btn--round btn--span btn--transparent',
                        onclick: this.shareToTwitter,
                    },
                    [
                        getElement('i', {
                            class: 'fa-brands fa-twitter btn__icon',
                        }),
                    ]
                ),
                getElement(
                    'button',
                    {
                        class: 'btn btn--round btn--span btn--transparent',
                        onclick: this.shareToTumblr,
                    },
                    [
                        getElement('i', {
                            class: 'fa-brands fa-tumblr btn__icon',
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
                    value: this.data.url,
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

    toggle = () => {
        this.inner.classList.toggle('hidden')
    }

    shareToTwitter = () => {
        const text = this.data.title
        const url = this.data.url
        const hashtags = 'post'

        const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`

        window.open(twitterIntentUrl, '_blank')
    }

    shareToTumblr = () => {
        const title = this.data.title
        const content = this.data.content
        const url = this.data.url
        const hashtags = 'post'

        const tumblrShareUrl = `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&caption=${encodeURIComponent(content)}&tags=${encodeURIComponent(hashtags)}`

        window.open(tumblrShareUrl, '_blank')
    }

    copy = (ev) => {
        navigator.clipboard.writeText(ev.target.previousElementSibling.value)
    }
}
