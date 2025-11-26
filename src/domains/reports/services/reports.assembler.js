import { TopProperty } from "../model/topProperties.entity.js";
import { EntitySelection } from "../model/entitySelection.entity.js";
import { SimulationsByMonth } from "../model/simulationsByMonth.entity.js";
import apiService from '../../../shared/infraestructure/services/api.service.js';

export class ReportsAssembler {
    static toTopProperties(response) {
        const data = Array.isArray(response) ? response : response.data || [];
        return data.map((r) => new TopProperty({
            propertyId: r.propertyId || r.id,
            code: r.code,
            title: r.title,
            price: r.price,
            currency: r.currency,
            consultCount: r.consultCount ?? r.count ?? 0
        }));
    }

    static toEntitySelections(response) {
        const data = Array.isArray(response) ? response : response.data || [];
        return data.map((r) => new EntitySelection({
            bankName: r.bankName || r.name,
            count: r.count ?? 0,
            percentage: r.percentage ?? 0
        }));
    }

    static toSimulationsByMonth(response) {
        const data = Array.isArray(response) ? response : response.data || [];
        return data.map((r) => new SimulationsByMonth({
            year: r.year,
            month: r.month,
            count: r.count,
            totalAmount: r.totalAmount,
            averageAmount: r.averageAmount
        }));
    }

    // Métodos para cada endpoint de reportes
    static async getReportsSummary() {
        try {
            const response = await apiService.getReportsSummary();
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async getMostConsultedProperties(limit) {
        try {
            const response = await apiService.getMostConsultedProperties(limit);
            return this.toTopProperties(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async getSimulationsByMonth(months) {
        try {
            const response = await apiService.getSimulationsByMonth(months);
            return this.toSimulationsByMonth(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async getEntitySelection() {
        try {
            const response = await apiService.getEntitySelection();
            return this.toEntitySelections(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async getPropertyConsultsByMonth() {
        try {
            const response = await apiService.getPropertyConsultsByMonth();
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}
