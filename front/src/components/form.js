export class Form {
    constructor(id, fields, onsubmit) {
        this.form = document.getElementById(id)
        this.error = this.form.getElementsByClassName('form__error')[0]
        this.submitter = this.form.getElementsByClassName('form__submit')[0]

        this.fields = Object.entries(fields).reduce(
            (obj, [id, { required }]) => {
                obj[id] = {
                    input: document.getElementById(id),
                    required: required ?? true,
                }
                return obj
            },
            {}
        )

        // trigger error clearing on fields update
        for (const [_, { input }] of Object.entries(this.fields)) {
            input.addEventListener('input', this.clearError)
        }

        if (this.fields.password) {
            const password = this.fields.password.input
            const confirmPassword = this.fields.confirmPassword?.input

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
            for (const [field, { input, required }] of Object.entries(
                this.fields
            )) {
                if (input.type == 'file') {
                    if (input.files.length == 0) {
                        if (required) {
                            this.setError(`Field ${field} cannot be empty`)
                            return
                        }

                        continue
                    }

                    data[field] = input.files[0]
                } else {
                    if (input.value.length == 0) {
                        if (required) {
                            this.setError(`Field ${field} cannot be empty`)
                            return
                        }

                        continue
                    }

                    data[field] = input.value
                }
            }

            await onsubmit(data, this.setError)

            // enable submit after handling
            this.submitter.disabled = false

            return false
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
