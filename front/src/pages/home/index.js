import { Navbar, PoemCard, PoemRow, UserRow } from '../../components/index.js'
import env from '../../env.js'
import { getErrorMessage, success } from '../../utils/api.js'

window.navbar = new Navbar()

window.onresize = () => {
    window.navbar.resize()
}

const loadTrendingPoems = async () => {
    try {
        const response = await fetch(
            `${env.LYRICAL_SERVICE_API_URL}/poems?start=0&count=5&sort=trending&order=desc`,
            { method: 'GET' }
        )

        const json = await response.json()

        if (!success(response.status)) {
            throw json
        }

        console.log(json)

        const newsSection = document.getElementById('trending')
        for (const index in json) {
            newsSection.appendChild(
                new PoemCard(json[index], 'Trending', index > 0).card
            )
        }
    } catch (e) {
        console.error(getErrorMessage(e))
    }
}

const loadPoemChart = async () => {
    try {
        const response = await fetch(
            `${env.LYRICAL_SERVICE_API_URL}/poems?start=0&count=5&sort=popular&order=desc`,
            { method: 'GET' }
        )

        const json = await response.json()

        if (!success(response.status)) {
            throw json
        }

        console.log(json)

        const newsSection = document.getElementById('poem-chart')
        for (const index in json) {
            newsSection.appendChild(
                new PoemRow(parseInt(index) + 1, json[index]).row
            )
        }
    } catch (e) {
        console.error(getErrorMessage(e))
    }
}

const loadNewPoems = async () => {
    try {
        const response = await fetch(
            `${env.LYRICAL_SERVICE_API_URL}/poems?start=0&count=5&sort=new&order=desc`,
            { method: 'GET' }
        )

        const json = await response.json()

        if (!success(response.status)) {
            throw json
        }

        console.log(json)

        const newsSection = document.getElementById('news')
        for (const index in json) {
            newsSection.appendChild(
                new PoemCard(json[index], 'News', true).card
            )
        }
    } catch (e) {
        console.error(getErrorMessage(e))
    }
}

const loadTopContributors = async () => {
    try {
        const response = await fetch(
            `${env.USER_SERVICE_API_URL}/users?start=0&count=5&sort=activity&order=desc`,
            { method: 'GET' }
        )

        const json = await response.json()

        if (!success(response.status)) {
            throw json
        }

        console.log(json)

        const topContributors = document.getElementById('top-contributors')
        for (const index in json) {
            topContributors.appendChild(
                new UserRow(parseInt(index) + 1, json[index]).row
            )
        }
    } catch (e) {
        console.error(getErrorMessage(e))
    }
}

window.onload = async () => {
    await loadTrendingPoems()
    await loadPoemChart()
    await loadNewPoems()
    await loadTopContributors()
}
