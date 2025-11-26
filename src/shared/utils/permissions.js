/**
 * Utilidades para control de permisos basados en roles
 * Roles: Admin = 1, Agent = 2, User = 3
 */

export const ROLES = {
    ADMIN: 1,
    AGENT: 2,
    USER: 3
};

export const ROLE_NAMES = {
    1: 'Admin',
    2: 'Agent',
    3: 'User'
};

// Mapeo de nombres de rol a números (para cuando el backend devuelve strings)
const ROLE_STRING_MAP = {
    'Admin': 1,
    'admin': 1,
    'ADMIN': 1,
    'Agent': 2,
    'agent': 2,
    'AGENT': 2,
    'User': 3,
    'user': 3,
    'USER': 3
};

/**
 * Obtiene el usuario actual del localStorage
 */
export const getCurrentUser = () => {
    const userData = localStorage.getItem('user-data');
    return userData ? JSON.parse(userData) : null;
};

/**
 * Verifica si hay un usuario autenticado
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('user-token');
};

/**
 * Obtiene el rol del usuario actual (normalizado a número)
 */
export const getUserRole = () => {
    const user = getCurrentUser();
    if (!user) return null;
    
    const role = user.role;
    
    // Si el rol es un número, devolverlo directamente
    if (typeof role === 'number') {
        return role;
    }
    
    // Si el rol es un string, intentar convertirlo
    if (typeof role === 'string') {
        // Primero intentar parsear como número
        const parsed = parseInt(role, 10);
        if (!isNaN(parsed)) {
            return parsed;
        }
        // Luego intentar mapear por nombre
        return ROLE_STRING_MAP[role] || null;
    }
    
    return null;
};

/**
 * Verifica si el usuario tiene un rol específico
 */
export const hasRole = (role) => {
    const userRole = getUserRole();
    return userRole === role;
};

/**
 * Verifica si el usuario es Admin
 */
export const isAdmin = () => hasRole(ROLES.ADMIN);

/**
 * Verifica si el usuario es Agent
 */
export const isAgent = () => hasRole(ROLES.AGENT);

/**
 * Verifica si el usuario es User
 */
export const isUser = () => hasRole(ROLES.USER);

/**
 * Verifica si el usuario es Admin o Agent
 */
export const isAdminOrAgent = () => isAdmin() || isAgent();

/**
 * Reglas de permisos para simulaciones
 */
export const canCreateSimulation = () => {
    // Todos pueden crear simulaciones
    return isAuthenticated();
};

export const canViewAllSimulations = () => {
    // Admin y Agent pueden ver todas las simulaciones
    return isAdminOrAgent();
};

export const canDeleteSimulation = (simulation) => {
    // Admin y Agent pueden eliminar todas
    // User solo puede eliminar simulaciones de sus propios clientes
    if (isAdminOrAgent()) return true;
    if (isUser()) {
        const user = getCurrentUser();
        // Aquí deberías verificar si el cliente de la simulación pertenece al usuario
        // Por ahora, asumimos que el backend lo valida
        return true;
    }
    return false;
};

/**
 * Reglas de permisos para clientes
 */
export const canCreateClient = () => {
    // Todos pueden crear clientes
    return isAuthenticated();
};

export const canEditClient = () => {
    // Todos pueden editar clientes
    return isAuthenticated();
};

export const canDeleteClient = () => {
    // Todos pueden eliminar clientes
    return isAuthenticated();
};

export const canViewAllClients = () => {
    // Admin y Agent pueden ver todos los clientes
    // User solo ve sus propios clientes
    return isAuthenticated();
};

/**
 * Reglas de permisos para propiedades
 */
export const canCreateProperty = () => {
    // Todos los usuarios autenticados pueden crear propiedades (actualizado según backend)
    return isAuthenticated();
};

export const canEditProperty = () => {
    // Solo Admin y Agent pueden editar propiedades
    return isAdminOrAgent();
};

export const canDeleteProperty = () => {
    // Solo Admin y Agent pueden eliminar propiedades
    return isAdminOrAgent();
};

export const canViewProperties = () => {
    // Todos pueden ver propiedades
    return isAuthenticated();
};

/**
 * Reglas de permisos para bancos/entidades financieras
 */
export const canManageBanks = () => {
    // Solo Admin puede gestionar bancos (POST, PUT, DELETE)
    return isAdmin();
};

/**
 * Reglas de permisos para usuarios
 */
export const canManageUsers = () => {
    // Solo Admin puede gestionar usuarios
    return isAdmin();
};

/**
 * Reglas de permisos para reportes
 */
export const canViewReports = () => {
    // Todos pueden ver reportes (el backend filtrará según permisos)
    return isAuthenticated();
};

/**
 * Obtiene el texto del rol actual
 */
export const getCurrentRoleText = () => {
    const role = getUserRole();
    return ROLE_NAMES[role] || 'Unknown';
};

/**
 * Verifica si el usuario puede realizar múltiples acciones
 */
export const can = (action) => {
    const permissions = {
        // Simulaciones
        'simulation.create': canCreateSimulation,
        'simulation.viewAll': canViewAllSimulations,
        'simulation.delete': canDeleteSimulation,
        
        // Clientes
        'client.create': canCreateClient,
        'client.edit': canEditClient,
        'client.delete': canDeleteClient,
        'client.viewAll': canViewAllClients,
        
        // Propiedades
        'property.create': canCreateProperty,
        'property.edit': canEditProperty,
        'property.delete': canDeleteProperty,
        'property.view': canViewProperties,
        
        // Bancos
        'bank.manage': canManageBanks,
        
        // Usuarios
        'user.manage': canManageUsers,
        
        // Reportes
        'report.view': canViewReports,
    };

    const permission = permissions[action];
    return permission ? permission() : false;
};
