import { Profile } from "../model/profile.entity.js"
import { FinancialEntity } from "../model/financialEntity.entity.js"
import apiClient from "../../../shared/infraestructure/services/api.client.js";

export class SettingsAssembler {
    static toProfile(response) {
        // response.data contiene el objeto del usuario directamente
        return new Profile(response.data)
    }

    static toFinancialEntities(response) {
        return response.data.map((r) => new FinancialEntity(r))
    }

    static async getSettings() {
        try {
            // Solicitamos /users/1 para simular que obtenemos el perfil del usuario logueado (ID 1)
            const [userResponse, entitiesResponse, settingsResponse] = await Promise.all([
                apiClient.get("/users/1"),
                apiClient.get("/financialEntities"),
                apiClient.get("/settings")
            ]);

            return {
                profile: this.toProfile(userResponse),
                financialEntities: this.toFinancialEntities(entitiesResponse),
                defaultCurrency: settingsResponse.data.defaultCurrency || "PEN",
                defaultRateType: settingsResponse.data.defaultRateType || "promedio",
            }
        } catch (error) {
            console.error("Error al cargar la configuración desde el API:", error);
            throw error;
        }
    }

    static async saveSettings(data) {
        try {
            console.log("Guardando configuración en API (simulado):", data)
            // Aquí podrías implementar apiClient.put(`/users/${data.profile.id}`, data.profile)
            return true
        } catch (error) {
            console.error("Error al guardar configuración:", error);
            return false;
        }
    }
}