export class Simulation {
    constructor({
        id = "",
        clientId = "",
        clientName = "",
        propertyId = "",
        propertyTitle = "",
        bank = null, // { id, name, annualRateTea, annualRateTna } or null
        principal = 0,
        currency = 1,
        rateType = 1,
        tea = 0,
        tna = 0,
        capitalizationPerYear = 0,
        termMonths = 0,
        graceType = 0,
        graceMonths = 0,
        startDate = "",
        applyMiViviendaBonus = false,
        bonusAmount = 0,
        lifeInsuranceRateMonthly = 0,
        riskInsuranceRateAnnual = 0,
        feesMonthly = 0,
        tem = 0,
        monthlyPayment = 0,
        tcea = 0,
        van = 0,
        tir = 0,
        totalInterest = 0,
        totalCost = 0,
        createdAtUtc = null,
        amortizationSchedule = []
    }) {
        this.id = id;
        this.clientId = clientId;
        this.clientName = clientName;
        this.propertyId = propertyId;
        this.propertyTitle = propertyTitle;
        this.bank = bank; // Object or null
        this.principal = principal;
        this.currency = currency; // 1 = PEN, 2 = USD
        this.rateType = rateType; // 1 = TEA, 2 = TNA
        this.tea = tea;
        this.tna = tna;
        this.capitalizationPerYear = capitalizationPerYear;
        this.termMonths = termMonths;
        this.graceType = graceType; // 0 = None, 1 = Total, 2 = Partial
        this.graceMonths = graceMonths;
        this.startDate = startDate;
        this.applyMiViviendaBonus = applyMiViviendaBonus;
        this.bonusAmount = bonusAmount;
        this.lifeInsuranceRateMonthly = lifeInsuranceRateMonthly;
        this.riskInsuranceRateAnnual = riskInsuranceRateAnnual;
        this.feesMonthly = feesMonthly;
        // Resultados calculados
        this.tem = tem;
        this.monthlyPayment = monthlyPayment;
        this.tcea = tcea;
        this.van = van;
        this.tir = tir;
        this.totalInterest = totalInterest;
        this.totalCost = totalCost;
        this.createdAtUtc = createdAtUtc;
        this.amortizationSchedule = amortizationSchedule;
    }
}

export class AmortizationItem {
    constructor({
        id = 0,
        period = 0,
        dueDate = "",
        openingBalance = 0,
        interest = 0,
        principal = 0,
        installment = 0,
        lifeInsurance = 0,
        riskInsurance = 0,
        fees = 0,
        closingBalance = 0
    }) {
        this.id = id; // Igual a period
        this.period = period;
        this.dueDate = dueDate;
        this.openingBalance = openingBalance;
        this.interest = interest;
        this.principal = principal;
        this.installment = installment;
        this.lifeInsurance = lifeInsurance;
        this.riskInsurance = riskInsurance;
        this.fees = fees;
        this.closingBalance = closingBalance;
    }
}
