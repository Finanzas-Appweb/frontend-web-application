import apiClient from "./api.client.js";

export default {
    // ========== AUTHENTICATION ==========
    login(email, password) {
        return apiClient.post("/auth/login", { email, password });
    },
    register(userData) {
        return apiClient.post("/auth/register", userData);
    },

    // ========== CLIENTS ==========
    getClients(params = {}) {
        return apiClient.get("/clients", { params });
    },
    getClient(id) {
        return apiClient.get(`/clients/${id}`);
    },
    createClient(clientData) {
        return apiClient.post("/clients", clientData);
    },
    updateClient(id, clientData) {
        return apiClient.put(`/clients/${id}`, clientData);
    },
    deleteClient(id) {
        return apiClient.delete(`/clients/${id}`);
    },

    // ========== PROPERTIES ==========
    getProperties(params = {}) {
        return apiClient.get("/properties", { params });
    },
    getProperty(id) {
        return apiClient.get(`/properties/${id}`);
    },
    createProperty(propertyData) {
        return apiClient.post("/properties", propertyData);
    },
    updateProperty(id, propertyData) {
        return apiClient.put(`/properties/${id}`, propertyData);
    },
    deleteProperty(id) {
        return apiClient.delete(`/properties/${id}`);
    },

    // ========== BANKS / FINANCIAL ENTITIES ==========
    getBanks() {
        return apiClient.get("/banks");
    },
    getBank(id) {
        return apiClient.get(`/banks/${id}`);
    },
    createBank(bankData) {
        return apiClient.post("/banks", bankData);
    },
    updateBank(id, bankData) {
        return apiClient.put(`/banks/${id}`, bankData);
    },
    deleteBank(id) {
        return apiClient.delete(`/banks/${id}`);
    },

    // También para /settings/financial-entities
    createFinancialEntity(entityData) {
        return apiClient.post("/settings/financial-entities", entityData);
    },

    // ========== SIMULATIONS ==========
    getSimulations(params = {}) {
        return apiClient.get("/simulations", { params });
    },
    getSimulation(id) {
        return apiClient.get(`/simulations/${id}`);
    },
    createSimulation(simulationData) {
        return apiClient.post("/simulations", simulationData);
    },
    deleteSimulation(id) {
        return apiClient.delete(`/simulations/${id}`);
    },

    // ========== USERS (Admin only) ==========
    getUsers() {
        return apiClient.get("/users");
    },
    getUser(id) {
        return apiClient.get(`/users/${id}`);
    },
    updateUser(id, userData) {
        return apiClient.put(`/users/${id}`, userData);
    },

    // ========== SETTINGS / PROFILE ==========
    getProfile() {
        return apiClient.get("/settings/profile");
    },
    updatePreferences(preferences) {
        return apiClient.put("/settings/preferences", preferences);
    },

    // ========== REPORTS ==========
    getReportsSummary() {
        return apiClient.get("/reports/summary");
    },
    getMostConsultedProperties() {
        return apiClient.get("/reports/most-consulted-properties");
    },
    getSimulationsByMonth() {
        return apiClient.get("/reports/simulations-by-month");
    },
    getEntitySelection() {
        return apiClient.get("/reports/entity-selection");
    },
    getPropertyConsultsByMonth() {
        return apiClient.get("/reports/property-consults-by-month");
    },
};
