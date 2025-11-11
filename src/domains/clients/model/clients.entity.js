export class Client {
    constructor({ id = "", name = "", email = "", phone = "", annualIncome = 0 }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.annualIncome = annualIncome;
    }
}
