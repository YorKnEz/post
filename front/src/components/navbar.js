import env from '../env.js'
import { getElement, toggleTheme } from '../utils/index.js'
import { Search, Sidebar } from './index.js'

export class Navbar {
    constructor() {
        this.search = new Search('search', 'nav')

        this.inner = getElement('nav', { id: 'nav', class: 'nav' }, [
            getElement('div', { class: 'nav__item' }, [
                getElement(
                    'button',
                    { class: 'nav__button', onclick: this.toggleMenu },
                    [getElement('i', { class: 'fa-solid fa-bars' })]
                ),
                getElement('a', { href: '/', class: 'nav__brand' }, [
                    document.createTextNode('PoST'),
                ]),
            ]),
            this.search.inner,
            getElement('div', { class: 'nav__buttons nav__item' }, [
                getElement('a', { class: 'nav__button', href: '/add-poem' }, [
                    getElement('i', { class: 'fa-solid fa-plus' }),
                ]),
                getElement(
                    'a',
                    {
                        class: 'nav__button',
                        href: `${env.LYRICAL_SERVICE_API_URL}/posts/rss.xml`,
                        target: '_blank',
                    },
                    [getElement('i', { class: 'fa-solid fa-rss' })]
                ),
                getElement(
                    'button',
                    { class: 'nav__button', onclick: this.changeTheme },
                    [getElement('i', { class: 'fa-solid fa-sun' })]
                ),
            ]),
        ])

        this.sidebar = new Sidebar()

        this.previousWindowWidth = window.innerWidth

        // attach components
        document.getElementById('nav').replaceWith(this.inner)
        document.getElementById('sidebar').replaceWith(this.sidebar.inner)

        window.addEventListener('resize', this.resize)
    }

    toggleMenu = () => {
        //const sidebar = document.getElementById('sidebar')
        const sidebarRect = this.sidebar.inner.getBoundingClientRect()

        if (sidebarRect.left != 0) {
            this.sidebar.inner.style.left = '0px'
        } else {
            this.sidebar.inner.style.left = '-300px'
        }
    }

    changeTheme = () => {
        toggleTheme()
    }

    resize = () => {
        // from big to small screen
        if (window.innerWidth <= 599 && 599 < this.previousWindowWidth) {
            ;[this.search.input.value, this.sidebar.search.input.value] = [
                this.sidebar.search.input.value,
                this.search.input.value,
            ]
        }

        // from small to big screen
        if (this.previousWindowWidth <= 599 && 599 < window.innerWidth) {
            ;[this.search.input.value, this.sidebar.search.input.value] = [
                this.sidebar.search.input.value,
                this.search.input.value,
            ]
        }

        this.previousWindowWidth = window.innerWidth
    }
}
