export class Bank {
    constructor({ 
        id = 0, 
        name = "", 
        annualRateTea = 0, 
        effectiveFrom = null 
    }) {
        this.id = id;
        this.name = name;
        this.annualRateTea = annualRateTea;
        this.effectiveFrom = effectiveFrom;
    }
}
