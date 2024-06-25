import {
    Dropdown,
    Loader,
    Navbar,
    PostRow,
    UserRow,
} from '../../components/index.js'
import { getPosts, getUsers } from '../../services/index.js'
import { getElement } from '../../utils/index.js'

window.navbar = new Navbar()

const postsLoader = new Loader('posts')
let postsLength = 0

const loadPosts = async (
    query = '',
    sort = 'popular',
    order = 'desc',
    start = 0,
    count = 5
) => {
    const content = postsLoader.getContent()

    try {
        const response = await getPosts({
            query,
            start,
            count,
            sort,
            order,
        })

        for (const index in response) {
            content.appendChild(
                new PostRow(
                    postsLength + parseInt(index) + 1,
                    response[index],
                    response[index].type
                ).inner
            )
        }

        postsLength += response.length

        content.appendChild(
            response.length > 0
                ? getElement(
                      'button',
                      {
                          class: 'btn',
                          onclick: () => {
                              content.lastChild.remove()
                              loadPosts(
                                  query,
                                  sort,
                                  order,
                                  start + postsLength,
                                  count
                              )
                          },
                      },
                      [document.createTextNode('Load more')]
                  )
                : getElement(
                      'button',
                      {
                          class: 'btn',
                          disabled: true,
                      },
                      [document.createTextNode('End of content')]
                  )
        )
    } catch (e) {
        console.error(e)
    }

    postsLoader.loaded()
}

const usersLoader = new Loader('users')
let usersLength = 0

const loadUsers = async (
    query = '',
    sort = 'popular',
    order = 'desc',
    start = 0,
    count = 5
) => {
    const content = usersLoader.getContent()

    try {
        const response = await getUsers({
            query,
            start,
            count,
            sort,
            order,
        })

        for (const index in response) {
            content.appendChild(
                new UserRow(usersLength + parseInt(index) + 1, response[index])
                    .inner
            )
        }

        usersLength += response.length

        content.appendChild(
            response.length > 0
                ? getElement(
                      'button',
                      {
                          class: 'btn',
                          onclick: () => {
                              content.lastChild.remove()
                              loadUsers(
                                  query,
                                  sort,
                                  order,
                                  start + usersLength,
                                  count
                              )
                          },
                      },
                      [document.createTextNode('Load more')]
                  )
                : getElement(
                      'button',
                      {
                          class: 'btn',
                          disabled: true,
                      },
                      [document.createTextNode('End of content')]
                  )
        )
    } catch (e) {
        console.error(e)
    }

    usersLoader.loaded()
}

window.onload = async () => {
    const params = new URLSearchParams(location.search)
    const query = params.get('query') ?? ''
    const sort = params.get('sort') ?? 'new'
    const order = params.get('order') ?? 'desc'

    try {
        loadPosts(query, sort, order)
        loadUsers(query, sort, order)
    } catch (e) {
        console.error(e)
    }
}

const getParam = (param) => {
    const params = new URLSearchParams(location.search)
    return params.get(param)
}

const setParam = (param, value) => {
    const params = new URLSearchParams(location.search)
    params.set(param, value)
    location.search = params.toString()
}

const sortOptions = {
    new: { title: 'New', value: 'new' },
    activity: { title: 'User activity', value: 'activity' },
    title: { title: 'Title', value: 'title' },
    poster: { title: 'Poster', value: 'poster' },
    author: { title: 'Author', value: 'author' },
    publication: { title: 'Publication date', value: 'publication' },
    popular: { title: 'Popular', value: 'popular' },
    trending: { title: 'Trending', value: 'trending' },
}

window.dropdown = new Dropdown(
    'sort-dropdown',
    sortOptions,
    (option) => setParam('sort', option.value),
    getParam('sort')
)

const orderOptions = {
    desc: { title: 'Descending', value: 'desc' },
    asc: { title: 'Ascending', value: 'asc' },
}

window.dropdown = new Dropdown(
    'order-dropdown',
    orderOptions,
    (option) => setParam('order', option.value),
    getParam('order')
)
