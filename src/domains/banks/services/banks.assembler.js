import { Bank } from '../model/bank.entity.js';
import apiService from '../../../shared/infraestructure/services/api.service.js';

export class BanksAssembler {
    static toEntitiesFromResponse(response) {
        const banks = Array.isArray(response) ? response : response.data || [];
        return banks.map((bank) => this.toEntityFromResource(bank));
    }

    static toEntityFromResource(resource) {
        return new Bank({
            id: resource.id,
            name: resource.name,
            annualRateTea: resource.annualRateTea,
            effectiveFrom: resource.effectiveFrom
        });
    }

    static toResourceFromEntity(bank) {
        return {
            name: bank.name,
            annualRateTea: bank.annualRateTea,
            effectiveFrom: bank.effectiveFrom
        };
    }

    // Métodos CRUD
    static async getBanks() {
        try {
            const response = await apiService.getBanks();
            return this.toEntitiesFromResponse(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async getBank(id) {
        try {
            const response = await apiService.getBank(id);
            return this.toEntityFromResource(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async createBank(bankData) {
        try {
            const resource = this.toResourceFromEntity(bankData);
            const response = await apiService.createBank(resource);
            return this.toEntityFromResource(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async updateBank(id, bankData) {
        try {
            const resource = this.toResourceFromEntity(bankData);
            const response = await apiService.updateBank(id, resource);
            return this.toEntityFromResource(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async deleteBank(id) {
        try {
            await apiService.deleteBank(id);
            return true;
        } catch (error) {
            throw error;
        }
    }
}
