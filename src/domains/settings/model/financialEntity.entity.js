export class FinancialEntity {
    constructor({ 
        id = 0, 
        name = "", 
        annualRateTea = 0,
        annualRateTna = 0,
        effectiveFrom = null,
        isActive = true
    } = {}) {
        this.id = id;
        this.name = name;
        this.annualRateTea = annualRateTea;
        this.annualRateTna = annualRateTna;
        this.effectiveFrom = effectiveFrom;
        this.isActive = isActive;
    }
}
