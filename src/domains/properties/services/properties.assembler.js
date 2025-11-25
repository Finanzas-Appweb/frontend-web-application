import { Property } from "../model/properties.entity.js";
import apiService from '../../../shared/infraestructure/services/api.service.js';

export class PropertiesAssembler {
    static toEntitiesFromResponse(response) {
        const properties = response.data || [];
        return properties.map((p) => this.toEntityFromResource(p));
    }

    static toEntityFromResource(resource) {
        return new Property({
            id: resource.id,
            code: resource.code,
            title: resource.title,
            description: resource.description || "",
            address: resource.address,
            district: resource.district,
            province: resource.province,
            type: resource.type,
            areaM2: resource.areaM2,
            price: resource.price,
            currency: resource.currency,
            images: resource.images || [],
            createdBy: resource.createdBy,
            createdAtUtc: resource.createdAtUtc,
            consultsCount: resource.consultsCount
        });
    }

    static toResourceFromEntity(property) {
        return {
            code: property.code,
            title: property.title,
            description: property.description || null,
            address: property.address,
            district: property.district,
            province: property.province,
            type: property.type,
            areaM2: property.areaM2,
            price: property.price,
            currency: property.currency,
            imagesUrl: property.imagesUrl || []
        };
    }

    // Métodos CRUD
    static async getProperties(params = {}) {
        try {
            const response = await apiService.getProperties(params);
            return {
                properties: this.toEntitiesFromResponse(response.data),
                pagination: response.data.pagination
            };
        } catch (error) {
            throw error;
        }
    }

    static async getProperty(id) {
        try {
            const response = await apiService.getProperty(id);
            return this.toEntityFromResource(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async createProperty(propertyData) {
        try {
            const resource = this.toResourceFromEntity(propertyData);
            const response = await apiService.createProperty(resource);
            return this.toEntityFromResource(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async updateProperty(id, propertyData) {
        try {
            const resource = this.toResourceFromEntity(propertyData);
            const response = await apiService.updateProperty(id, resource);
            return this.toEntityFromResource(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async deleteProperty(id) {
        try {
            await apiService.deleteProperty(id);
            return true;
        } catch (error) {
            throw error;
        }
    }
}
