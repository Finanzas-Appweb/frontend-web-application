import { Simulation, AmortizationItem } from "../model/simulations.entity.js";
import apiService from '../../../shared/infraestructure/services/api.service.js';

export class SimulationsAssembler {
    static toEntitiesFromResponse(response) {
        const simulations = response.data || [];
        return simulations.map((s) => this.toEntityFromResource(s));
    }

    static toEntityFromResource(resource) {
        return new Simulation({
            id: resource.id,
            clientId: resource.clientId,
            clientName: resource.clientName,
            propertyId: resource.propertyId,
            propertyTitle: resource.propertyTitle,
            bankId: resource.bankId,
            bankName: resource.bankName,
            principal: resource.principal,
            currency: resource.currency,
            rateType: resource.rateType,
            tea: resource.tea,
            tna: resource.tna,
            capitalizationPerYear: resource.capitalizationPerYear,
            termMonths: resource.termMonths,
            graceType: resource.graceType,
            graceMonths: resource.graceMonths,
            startDate: resource.startDate,
            applyMiViviendaBonus: resource.applyMiViviendaBonus,
            bonusAmount: resource.bonusAmount,
            lifeInsuranceRateMonthly: resource.lifeInsuranceRateMonthly,
            riskInsuranceRateAnnual: resource.riskInsuranceRateAnnual,
            feesMonthly: resource.feesMonthly,
            tem: resource.tem,
            monthlyPayment: resource.monthlyPayment,
            tcea: resource.tcea,
            van: resource.van,
            tir: resource.tir,
            totalInterest: resource.totalInterest,
            totalCost: resource.totalCost,
            createdAtUtc: resource.createdAtUtc,
            amortizationSchedule: (resource.amortizationSchedule || []).map(item => new AmortizationItem(item))
        });
    }

    static toResourceFromEntity(simulation) {
        const resource = {
            clientId: simulation.clientId,
            propertyId: simulation.propertyId,
            bankId: simulation.bankId,
            principal: simulation.principal,
            currency: simulation.currency,
            rateType: simulation.rateType,
            tea: simulation.tea,
            tna: simulation.tna,
            capitalizationPerYear: simulation.capitalizationPerYear,
            termMonths: simulation.termMonths,
            graceType: simulation.graceType,
            graceMonths: simulation.graceMonths,
            startDate: simulation.startDate,
            applyMiViviendaBonus: simulation.applyMiViviendaBonus,
            bonusAmount: simulation.bonusAmount,
            lifeInsuranceRateMonthly: simulation.lifeInsuranceRateMonthly,
            riskInsuranceRateAnnual: simulation.riskInsuranceRateAnnual,
            feesMonthly: simulation.feesMonthly
        };

        // Validación de bono MiVivienda
        if (!resource.applyMiViviendaBonus) {
            resource.bonusAmount = 0;
        } else {
            if (!resource.bonusAmount || resource.bonusAmount <= 0 || resource.bonusAmount >= resource.principal) {
                throw new Error('El bono MiVivienda debe ser mayor a 0 y menor al monto principal');
            }
        }

        return resource;
    }

    // Métodos CRUD
    static async getSimulations(params = {}) {
        try {
            const response = await apiService.getSimulations(params);
            return {
                simulations: this.toEntitiesFromResponse(response.data),
                pagination: response.data.pagination
            };
        } catch (error) {
            throw error;
        }
    }

    static async getSimulation(id) {
        try {
            const response = await apiService.getSimulation(id);
            return this.toEntityFromResource(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async createSimulation(simulationData) {
        try {
            const resource = this.toResourceFromEntity(simulationData);
            const response = await apiService.createSimulation(resource);
            return this.toEntityFromResource(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async deleteSimulation(id) {
        try {
            await apiService.deleteSimulation(id);
            return true;
        } catch (error) {
            throw error;
        }
    }
}
