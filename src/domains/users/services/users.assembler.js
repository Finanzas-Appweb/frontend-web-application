import { User } from '../model/user.entity.js';
import apiService from '../../../shared/infraestructure/services/api.service.js';

export class UsersAssembler {
    static toEntitiesFromResponse(response) {
        const users = Array.isArray(response) ? response : response.data || [];
        return users.map((user) => this.toEntityFromResource(user));
    }

    static toEntityFromResource(resource) {
        return new User({
            id: resource.id,
            username: resource.username,
            firstName: resource.firstName,
            lastName: resource.lastName,
            dni: resource.dni,
            email: resource.email,
            phone: resource.phone,
            role: resource.role,
            createdAtUtc: resource.createdAtUtc,
            defaultCurrency: resource.defaultCurrency,
            defaultRateType: resource.defaultRateType
        });
    }

    static toResourceFromEntity(user) {
        return {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            dni: user.dni,
            email: user.email,
            phone: user.phone,
            defaultCurrency: user.defaultCurrency,
            defaultRateType: user.defaultRateType
        };
    }

    // Métodos CRUD (solo para Admin)
    static async getUsers() {
        try {
            const response = await apiService.getUsers();
            return this.toEntitiesFromResponse(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async getUser(id) {
        try {
            const response = await apiService.getUser(id);
            return this.toEntityFromResource(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async updateUser(id, userData) {
        try {
            const resource = this.toResourceFromEntity(userData);
            const response = await apiService.updateUser(id, resource);
            return this.toEntityFromResource(response.data);
        } catch (error) {
            throw error;
        }
    }
}
