export class TopProperty {
    constructor({
        propertyId = "",
        code = "",
        title = "",
        price = 0,
        currency = 1,
        consultCount = 0
    }) {
        this.propertyId = propertyId;
        this.code = code;
        this.title = title;
        this.price = price;
        this.currency = currency;
        this.consultCount = consultCount;
    }
}
