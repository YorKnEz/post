export class Form {
    constructor(fields, onsubmit) {
        this.fields = fields
        this.error = document.getElementById('form-error')

        if (this.fields.includes('password')) {
            document.getElementById('password-toggler').onclick = (ev) => {
                const input = ev.target.previousElementSibling

                input.type = input.type == 'password' ? 'text' : 'password'
                ev.target.classList.toggle('fa-eye')
                ev.target.classList.toggle('fa-eye-slash')
            }
        }

        document.getElementById('form').onsubmit = (ev) => {
            ev.preventDefault()
            this.clearError()

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

            onsubmit(data, this.setError)
        }
    }

    clearError = () => {
        this.error.innerHTML = ''
        this.error.classList.add('hidden')
    }

    setError = (error) => {
        this.error.innerHTML = error
        this.error.classList.remove('hidden')
    }
}
