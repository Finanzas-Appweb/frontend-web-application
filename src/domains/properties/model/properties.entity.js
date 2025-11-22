export class Property {
    constructor({ 
        id = "", 
        code = "", 
        title = "",
        address = "", 
        district = "",
        province = "",
        type = 1, 
        areaM2 = 0, 
        price = 0,
        currency = 1,
        images = [],
        imagesUrl = [],
        createdBy = "",
        createdAtUtc = null,
        consultsCount = 0
    }) {
        this.id = id;
        this.code = code;
        this.title = title;
        this.address = address;
        this.district = district;
        this.province = province;
        this.type = type; // 1 = House, 2 = Apartment, etc.
        this.areaM2 = areaM2;
        this.price = price;
        this.currency = currency; // 1 = PEN, 2 = USD
        this.images = images; // Array de { id, url }
        this.imagesUrl = imagesUrl; // Array de strings (para crear/editar)
        this.createdBy = createdBy;
        this.createdAtUtc = createdAtUtc;
        this.consultsCount = consultsCount;
    }
}
