import { Profile } from "../model/profile.entity.js";
import { FinancialEntity } from "../model/financialEntity.entity.js";
import apiService from "../../../shared/infraestructure/services/api.service.js";

export class SettingsAssembler {
    static toProfile(response) {
        const data = response.data || response;
        return new Profile({
            id: data.id,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            dni: data.dni,
            email: data.email,
            phone: data.phone,
            role: data.role,
            createdAtUtc: data.createdAtUtc,
            defaultCurrency: data.defaultCurrency,
            defaultRateType: data.defaultRateType
        });
    }

    static toFinancialEntities(response) {
        const entities = Array.isArray(response) ? response : response.data || [];
        return entities.map((r) => new FinancialEntity({
            id: r.id,
            name: r.name,
            annualRateTea: r.annualRateTea,
            effectiveFrom: r.effectiveFrom
        }));
    }

    // Obtener perfil del usuario autenticado
    static async getProfile() {
        try {
            const response = await apiService.getProfile();
            return this.toProfile(response);
        } catch (error) {
            throw error;
        }
    }

    // Obtener todas las entidades financieras (bancos)
    static async getFinancialEntities() {
        try {
            const response = await apiService.getBanks();
            return this.toFinancialEntities(response.data);
        } catch (error) {
            throw error;
        }
    }

    // Obtener configuración completa
    static async getSettings() {
        try {
            const [profileResponse, entitiesResponse] = await Promise.all([
                apiService.getProfile(),
                apiService.getBanks()
            ]);

            return {
                profile: this.toProfile(profileResponse),
                financialEntities: this.toFinancialEntities(entitiesResponse.data),
                defaultCurrency: profileResponse.data.defaultCurrency || 1,
                defaultRateType: profileResponse.data.defaultRateType || 1
            };
        } catch (error) {
            throw error;
        }
    }

    // Actualizar preferencias del usuario
    static async updatePreferences(preferences) {
        try {
            await apiService.updatePreferences(preferences);
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Crear entidad financiera (solo Admin)
    static async createFinancialEntity(entityData) {
        try {
            const response = await apiService.createFinancialEntity(entityData);
            return new FinancialEntity(response.data);
        } catch (error) {
            throw error;
        }
    }
}