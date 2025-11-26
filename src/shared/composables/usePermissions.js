import { computed } from 'vue';
import * as permissions from '../utils/permissions.js';

/**
 * Composable para manejar permisos de usuario en componentes Vue
 */
export function usePermissions() {
    const user = computed(() => permissions.getCurrentUser());
    const isAuthenticated = computed(() => permissions.isAuthenticated());
    const userRole = computed(() => permissions.getUserRole());
    const roleText = computed(() => permissions.getCurrentRoleText());

    // Roles
    const isAdmin = computed(() => permissions.isAdmin());
    const isAgent = computed(() => permissions.isAgent());
    const isUser = computed(() => permissions.isUser());
    const isAdminOrAgent = computed(() => permissions.isAdminOrAgent());

    // Permisos de simulaciones
    const canCreateSimulation = computed(() => permissions.canCreateSimulation());
    const canViewAllSimulations = computed(() => permissions.canViewAllSimulations());
    
    // Permisos de clientes
    const canCreateClient = computed(() => permissions.canCreateClient());
    const canEditClient = computed(() => permissions.canEditClient());
    const canDeleteClient = computed(() => permissions.canDeleteClient());
    const canViewAllClients = computed(() => permissions.canViewAllClients());

    // Permisos de propiedades
    const canCreateProperty = computed(() => permissions.canCreateProperty());
    const canEditProperty = computed(() => permissions.canEditProperty());
    const canDeleteProperty = computed(() => permissions.canDeleteProperty());
    const canViewProperties = computed(() => permissions.canViewProperties());

    // Permisos de bancos
    const canManageBanks = computed(() => permissions.canManageBanks());

    // Permisos de usuarios
    const canManageUsers = computed(() => permissions.canManageUsers());

    // Permisos de reportes
    const canViewReports = computed(() => permissions.canViewReports());

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
        can
    };
}
