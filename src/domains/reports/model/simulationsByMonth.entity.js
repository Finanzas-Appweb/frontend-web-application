export class SimulationsByMonth {
    constructor({
        year = 0,
        month = 0,
        count = 0,
        totalAmount = 0,
        averageAmount = 0
    }) {
        this.year = year;
        this.month = month;
        this.count = count;
        this.totalAmount = totalAmount;
        this.averageAmount = averageAmount;
    }
}
