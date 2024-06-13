import { Router } from '../../../lib/routing/index.js'

export const router = new Router('Posts Router', '/api/posts')

router.get('/', async (req, res) => { })

router.post('/', async (req, res) => { })

router.get('/:id', async (req, res) => { })

router.patch('/:id', async (req, res) => { })

router.delete('/:id', async (req, res) => { })
