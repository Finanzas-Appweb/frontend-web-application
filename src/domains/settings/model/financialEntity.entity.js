export class FinancialEntity {
    constructor({ id = Date.now(), name = "", rate = "0.00" } = {}) { // = {} aquí también
        this.id = id
        this.name = name
        this.rate = rate
    }
}
