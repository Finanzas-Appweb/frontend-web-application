export class Profile {
    constructor({
                    id = "",
                    username = "",
                    firstName = "",
                    lastName = "",
                    dni = "",
                    phone = "",
                    email = ""
                } = {}) {
        this.id = id
        this.username = username
        this.firstName = firstName
        this.lastName = lastName
        this.dni = dni
        this.phone = phone
        this.email = email
    }
}
