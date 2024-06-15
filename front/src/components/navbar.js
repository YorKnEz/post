import { toggleTheme } from '../utils/index.js'

export class Navbar {
    constructor() {
        this.sidebar = document.getElementById('sidebar')

        this.navSearchInput =
            document.getElementsByClassName('search__input')[0]
        this.sideSearchInput =
            document.getElementsByClassName('search__input')[1]

        this.previousWindowWidth = window.innerWidth
    }

    toggleMenu = () => {
        //const sidebar = document.getElementById('sidebar')
        const sidebarRect = this.sidebar.getBoundingClientRect()

        if (sidebarRect.left != 0) {
            this.sidebar.style.left = '0px'
        } else {
            this.sidebar.style.left = '-300px'
        }
    }

    changeTheme = () => {
        toggleTheme()
    }

    copySearchInput = () => {
        if (window.innerWidth <= 599 && 599 < this.previousWindowWidth) {
            console.log(this.navSearchInput.value)
            this.sideSearchInput.value = this.navSearchInput.value
        }

        if (this.previousWindowWidth <= 599 && 599 < window.innerWidth) {
            this.navSearchInput.value = this.sideSearchInput.value
        }

        this.previousWindowWidth = window.innerWidth
    }
}
