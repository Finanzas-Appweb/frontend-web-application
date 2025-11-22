import { Client } from '../model/clients.entity.js';
import apiService from '../../../shared/infraestructure/services/api.service.js';

export class ClientsAssembler {
    static toEntitiesFromResponse(response) {
        // El backend devuelve { data: [], pagination: {} }
        const clients = response.data || [];
        return clients.map((client) => this.toEntityFromResource(client));
    }

    static toEntityFromResource(resource) {
        return new Client({
            id: resource.id,
            firstName: resource.firstName,
            lastName: resource.lastName,
            fullName: resource.fullName,
            email: resource.email,
            phone: resource.phone,
            annualIncome: resource.annualIncome,
            createdByUserName: resource.createdByUserName,
            createdAtUtc: resource.createdAtUtc
        });
    }

    static toResourceFromEntity(client) {
        return {
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            phone: client.phone,
            annualIncome: client.annualIncome
        };
    }

    // Métodos CRUD
    static async getClients(params = {}) {
        try {
            const response = await apiService.getClients(params);
            return {
                clients: this.toEntitiesFromResponse(response.data),
                pagination: response.data.pagination
            };
        } catch (error) {
            throw error;
        }
    }

    static async getClient(id) {
        try {
            const response = await apiService.getClient(id);
            return this.toEntityFromResource(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async createClient(clientData) {
        try {
            const resource = this.toResourceFromEntity(clientData);
            const response = await apiService.createClient(resource);
            return this.toEntityFromResource(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async updateClient(id, clientData) {
        try {
            const resource = this.toResourceFromEntity(clientData);
            const response = await apiService.updateClient(id, resource);
            return this.toEntityFromResource(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async deleteClient(id) {
        try {
            await apiService.deleteClient(id);
            return true;
        } catch (error) {
            throw error;
        }
    }
}
