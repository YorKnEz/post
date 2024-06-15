export class Form {
    constructor(id, fields, onsubmit) {
        this.form = document.getElementById(id)
        this.error = this.form.getElementsByClassName('form__error')[0]
        this.submitter = this.form.getElementsByClassName('form__submit')[0]

        this.fields = fields

        // trigger error clearing on fields update
        for (const field of fields) {
            document
                .getElementById(field)
                .addEventListener('input', this.clearError)
        }

        if (this.fields.includes('password')) {
            const password = document.getElementById('password')
            const confirmPassword = document.getElementById('confirmPassword')
            document.getElementById('password-toggler').onclick = (ev) => {
                password.type =
                    password.type == 'password' ? 'text' : 'password'

                if (confirmPassword) {
                    confirmPassword.type =
                        confirmPassword.type == 'password' ? 'text' : 'password'
                }

                ev.target.classList.toggle('fa-eye')
                ev.target.classList.toggle('fa-eye-slash')
            }
        }

        this.form.onsubmit = async (ev) => {
            ev.preventDefault()
            this.clearError()
            // disable submit button while submit is handled
            this.submitter.disabled = true

            const data = {}

            // all fields are required
            for (const field of this.fields) {
                const { value, placeholder } = document.getElementById(field)

                if (value.length == 0) {
                    this.setError(`${placeholder} field cannot be empty`)

                    return
                }

                data[field] = value
            }

            await onsubmit(data, this.setError)

            // enable submit after handling
            this.submitter.disabled = false
        }
    }

    clearError = () => {
        this.error.innerHTML = ''
        this.error.classList.add('hidden')
        // enable button upon error clearing
        this.submitter.disabled = false
    }

    setError = (error) => {
        this.error.innerHTML = error
        this.error.classList.remove('hidden')
        // disable button on error
        this.submitter.disabled = true
    }
}
