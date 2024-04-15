import { Form } from '../../components/form.js'
import { toggleTheme } from '../../utils.js'

window.toggleTheme = toggleTheme

window.form = new Form(['email', 'password', 'confirmPassword'], (data, setError) => {
    if (data.password == 'test') {
        setError('Your password is too weak')
        return
    }

    console.log(data)
})
