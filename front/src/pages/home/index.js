import {
    Loader,
    Navbar,
    PostRow,
    PostCard,
    UserRow,
} from '../../components/index.js'
import { getPosts, getUsers } from '../../services/index.js'
import { getErrorMessage, getElement } from '../../utils/index.js'

window.navbar = new Navbar()

const loadTrendingPoems = async (content) => {
    const response = await getPosts({
        start: 0,
        count: 5,
        sort: 'trending',
        order: 'desc',
    })

    for (const index in response) {
        content.appendChild(
            new PostCard(response[index], 'Trending', index > 0).inner
        )
    }
}

const loadPoemChart = async (content) => {
    const response = await getPosts({
        start: 0,
        count: 5,
        sort: 'popular',
        order: 'desc',
    })

    for (const index in response) {
        content.appendChild(
            new PostRow(parseInt(index) + 1, response[index]).inner
        )
    }
}

const loadNews = async (content) => {
    const response = await getPosts({
        start: 0,
        count: 8,
        sort: 'new',
        order: 'desc',
    })

    for (const index in response) {
        content.appendChild(new PostCard(response[index], 'News', true).inner)
    }
}

const loadTopContributors = async (content) => {
    const response = await getUsers({
        start: 0,
        count: 5,
        sort: 'activity',
        order: 'desc',
    })

    for (const index in response) {
        content.appendChild(
            new UserRow(parseInt(index) + 1, response[index]).inner
        )
    }
}

const loaders = {
    trending: {
        loader: new Loader('trending'),
        cb: loadTrendingPoems,
    },
    'poem-chart': {
        loader: new Loader('poem-chart'),
        cb: loadPoemChart,
    },
    news: { loader: new Loader('news'), cb: loadNews },
    'top-contributors': {
        loader: new Loader('top-contributors'),
        cb: loadTopContributors,
    },
}

const load = async ({ loader, cb }) => {
    const content = loader.getContent()

    console.log(content)

    try {
        await cb(content)
    } catch (e) {
        console.error(getErrorMessage(e))
        content.appendChild(
            getElement('span', { class: 'col-xs-4 col-sm-8 col-md-12' }, [
                document.createTextNode(getErrorMessage(e)),
            ])
        )
    }

    loader.loaded()
}

window.onload = async () => {
    for (const [_, data] of Object.entries(loaders)) {
        load(data)
    }
}
