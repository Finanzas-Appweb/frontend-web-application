import { Profile } from "../model/profile.entity.js"
import { FinancialEntity } from "../model/financialEntity.entity.js"

export class SettingsAssembler {
    static toProfile(response) {
        return new Profile(response.data)
    }

    static toFinancialEntities(response) {
        return response.data.map((r) => new FinancialEntity(r))
    }

    static async getSettings() {
        // Simulación de datos (puedes reemplazar luego con fetch o axios)
        const profileResponse = {
            data: {
                username: "rtasayco",
                firstName: "Raúl Hiroshi",
                lastName: "Tasayco Osorio",
                dni: "74851236",
                phone: "987654321",
                email: "raul@upc.edu.pe",
            },
        }

        const financialEntitiesResponse = {
            data: [
                { id: 1, name: "BCP", rate: "3.74" },
                { id: 2, name: "Interbank", rate: "3.76" },
                { id: 3, name: "Scotiabank", rate: "3.78" },
            ],
        }

        return {
            profile: this.toProfile(profileResponse),
            financialEntities: this.toFinancialEntities(financialEntitiesResponse),
            defaultCurrency: "PEN",
            defaultRateType: "promedio",
        }
    }

    static async saveSettings(data) {
        console.log("Guardando configuración:", data)
        // Aquí podrías hacer un POST o PUT a tu API
        return true
    }
}
