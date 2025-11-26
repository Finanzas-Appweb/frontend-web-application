import { computed, ref, watchEffect } from 'vue';
import * as permissions from '../utils/permissions.js';

// Reactive trigger que fuerza re-evaluación cuando cambia el usuario
const authTrigger = ref(0);

/**
 * Fuerza actualización de permisos (llamar después de login/logout)
 */
export const refreshPermissions = () => {
    authTrigger.value++;
};

// Escuchar cambios en localStorage para actualizar permisos automáticamente
if (typeof window !== 'undefined') {
    window.addEventListener('storage', () => {
        refreshPermissions();
    });
}

/**
 * Composable para manejar permisos de usuario en componentes Vue
 */
export function usePermissions() {
    // Forzar dependencia del trigger para reactividad
    const user = computed(() => {
        authTrigger.value; // Dependency tracking
        return permissions.getCurrentUser();
    });
    const isAuthenticated = computed(() => {
        authTrigger.value;
        return permissions.isAuthenticated();
    });
    const userRole = computed(() => {
        authTrigger.value;
        return permissions.getUserRole();
    });
    const roleText = computed(() => {
        authTrigger.value;
        return permissions.getCurrentRoleText();
    });

    // Roles
    const isAdmin = computed(() => {
        authTrigger.value;
        return permissions.isAdmin();
    });
    const isAgent = computed(() => {
        authTrigger.value;
        return permissions.isAgent();
    });
    const isUser = computed(() => {
        authTrigger.value;
        return permissions.isUser();
    });
    const isAdminOrAgent = computed(() => {
        authTrigger.value;
        return permissions.isAdminOrAgent();
    });

    // Permisos de simulaciones
    const canCreateSimulation = computed(() => {
        authTrigger.value;
        return permissions.canCreateSimulation();
    });
    const canViewAllSimulations = computed(() => {
        authTrigger.value;
        return permissions.canViewAllSimulations();
    });
    
    // Permisos de clientes
    const canCreateClient = computed(() => {
        authTrigger.value;
        return permissions.canCreateClient();
    });
    const canEditClient = computed(() => {
        authTrigger.value;
        return permissions.canEditClient();
    });
    const canDeleteClient = computed(() => {
        authTrigger.value;
        return permissions.canDeleteClient();
    });
    const canViewAllClients = computed(() => {
        authTrigger.value;
        return permissions.canViewAllClients();
    });

    // Permisos de propiedades
    const canCreateProperty = computed(() => {
        authTrigger.value;
        return permissions.canCreateProperty();
    });
    const canEditProperty = computed(() => {
        authTrigger.value;
        return permissions.canEditProperty();
    });
    const canDeleteProperty = computed(() => {
        authTrigger.value;
        return permissions.canDeleteProperty();
    });
    const canViewProperties = computed(() => {
        authTrigger.value;
        return permissions.canViewProperties();
    });

    // Permisos de bancos
    const canManageBanks = computed(() => {
        authTrigger.value;
        return permissions.canManageBanks();
    });

    // Permisos de usuarios
    const canManageUsers = computed(() => {
        authTrigger.value;
        return permissions.canManageUsers();
    });

    // Permisos de reportes
    const canViewReports = computed(() => {
        authTrigger.value;
        return permissions.canViewReports();
    });

    // Función genérica para verificar permisos
    const can = (action) => permissions.can(action);

    return {
        // Usuario
        user,
        isAuthenticated,
        userRole,
        roleText,

        // Roles
        isAdmin,
        isAgent,
        isUser,
        isAdminOrAgent,

        // Permisos de simulaciones
        canCreateSimulation,
        canViewAllSimulations,

        // Permisos de clientes
        canCreateClient,
        canEditClient,
        canDeleteClient,
        canViewAllClients,

        // Permisos de propiedades
        canCreateProperty,
        canEditProperty,
        canDeleteProperty,
        canViewProperties,

        // Permisos de bancos
        canManageBanks,

        // Permisos de usuarios
        canManageUsers,

        // Permisos de reportes
        canViewReports,

        // Función genérica
        can,
        
        // Método para refrescar permisos manualmente
        refresh: refreshPermissions
    };
}
