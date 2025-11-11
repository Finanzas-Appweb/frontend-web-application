import { Client } from '../model/clients.entity.js';

export class ClientsAssembler {
    static toEntitiesFromResponse(response) {
        return response.data.map((client) => this.toEntityFromResource(client));
    }

    static toEntityFromResource(resource) {
        return new Client({
            id: resource.id,
            name: resource.name,
            email: resource.email,
            phone: resource.phone,
            annualIncome: resource.annualIncome,
        });
    }
}
