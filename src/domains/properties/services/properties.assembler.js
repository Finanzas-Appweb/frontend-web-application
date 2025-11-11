import { Property } from "../model/properties.entity.js";

export class PropertiesAssembler {
    static toEntitiesFromResponse(response) {
        return response.data.map((p) => this.toEntityFromResource(p));
    }

    static toEntityFromResource(resource) {
        return new Property({
            id: resource.id,
            code: resource.code,
            price: resource.price,
            address: resource.address,
            city: resource.city,
            type: resource.type,
            area: resource.area,
            imageUrl: resource.imageUrl,
        });
    }
}
