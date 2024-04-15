import { Form } from '../../components/form.js'
import { toggleTheme } from '../../utils.js'

window.toggleTheme = toggleTheme

window.form = new Form(['nickname', 'password'], (data, setError) => {
    if (data.password == 'test') {
        setError('Your password is too weak')
        return
    }

    console.log(data)
})
