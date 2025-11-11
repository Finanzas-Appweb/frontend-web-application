export class Property {
    constructor({ id = "", code = "", price = 0, address = "", city = "", type = "", area = 0, imageUrl = "" }) {
        this.id = id;
        this.code = code;
        this.price = price;
        this.address = address;
        this.city = city;
        this.type = type;
        this.area = area;
        this.imageUrl = imageUrl;
    }
}
