import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3536",
    headers: {
        "Content-Type": "application/json",
    },
});

export default {
    // --- Users ---
    getUsers() {
        return apiClient.get("/users");
    },
    getUser(id) {
        return apiClient.get(`/users/${id}`);
    },

    // --- Clients ---
    getClients() {
        return apiClient.get("/clients");
    },
    getClient(id) {
        return apiClient.get(`/clients/${id}`);
    },

    // --- Properties ---
    getProperties() {
        return apiClient.get("/properties");
    },
    getProperty(id) {
        return apiClient.get(`/properties/${id}`);
    },

    // --- Simulations ---
    getSimulations() {
        return apiClient.get("/simulations");
    },
    getSimulation(id) {
        return apiClient.get(`/simulations/${id}`);
    },

    // --- Profile ---
    getProfile() {
        return apiClient.get("/profile");
    },

    // --- Settings ---
    getSettings() {
        return apiClient.get("/settings");
    },

    // --- Financial Entities ---
    getFinancialEntities() {
        return apiClient.get("/financialEntities");
    },

    // --- Dashboard / Reports ---
    getDashboardStats() {
        return apiClient.get("/dashboardStats");
    },
    getTopPropertiesReport() {
        return apiClient.get("/topPropertiesReport");
    },
    getEntitySelectionReport() {
        return apiClient.get("/entitySelectionReport");
    },
    getSimulationsByMonthReport() {
        return apiClient.get("/simulationsByMonthReport");
    },
};
