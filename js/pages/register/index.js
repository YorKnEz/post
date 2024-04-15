import { Form } from '../../components/form.js'
import { toggleTheme } from '../../utils.js'

window.toggleTheme = toggleTheme

window.form = new Form(
    [
        'firstName',
        'lastName',
        'nickname',
        'email',
        'password',
        'confirmPassword',
    ],
    (data, setError) => {
        if (data.password != data.confirmPassword) {
            setError('Passwords are not the same')
            return
        }

        console.log(data)
    }
)
