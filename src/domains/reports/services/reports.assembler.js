import { TopProperty } from "../model/topProperties.entity.js";
import { EntitySelection } from "../model/entitySelection.entity.js";
import { SimulationsByMonth } from "../model/simulationsByMonth.entity.js";
import apiService from '../../../shared/infraestructure/services/api.service.js';

export class ReportsAssembler {
    static toTopProperties(response) {
        const data = Array.isArray(response) ? response : response.data || [];
        return data.map((r) => new TopProperty(r));
    }

    static toEntitySelections(response) {
        const data = Array.isArray(response) ? response : response.data || [];
        return data.map((r) => new EntitySelection(r));
    }

    static toSimulationsByMonth(response) {
        const data = Array.isArray(response) ? response : response.data || [];
        return data.map((r) => new SimulationsByMonth(r));
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

    static async getMostConsultedProperties() {
        try {
            const response = await apiService.getMostConsultedProperties();
            return this.toTopProperties(response.data);
        } catch (error) {
            throw error;
        }
    }

    static async getSimulationsByMonth() {
        try {
            const response = await apiService.getSimulationsByMonth();
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
