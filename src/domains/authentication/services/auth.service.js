import apiClient from "../../../shared/infraestructure/services/api.client.js";

export const login = async (email, password) => {
    try {
        const response = await apiClient.post('/auth/login', {
            email,
            password
        });

        const { token, user } = response.data;

        // Guardar token y datos de usuario
        localStorage.setItem('user-token', token);
        localStorage.setItem('user-data', JSON.stringify(user));

        return user;
    } catch (error) {
        const errorMessage = error.response?.data?.detail || error.response?.data?.title || 'Usuario o contraseña incorrectos';
        throw new Error(errorMessage);
    }
};

export const register = async (userData) => {
    try {
        // userData debe contener: username, firstName, lastName, dni, email, phone, password
        const response = await apiClient.post('/auth/register', userData);

        const { token, user } = response.data;

        // Guardar token y datos de usuario
        localStorage.setItem('user-token', token);
        localStorage.setItem('user-data', JSON.stringify(user));

        return user;
    } catch (error) {
        const errorMessage = error.response?.data?.detail || error.response?.data?.title || 'Error al registrar usuario';
        throw new Error(errorMessage);
    }
};

export const logout = () => {
    localStorage.removeItem('user-token');
    localStorage.removeItem('user-data');
};

export const getCurrentUser = () => {
    const userData = localStorage.getItem('user-data');
    return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('user-token');
};

export const hasRole = (role) => {
    const user = getCurrentUser();
    return user?.role === role;
};

export const isAdmin = () => hasRole('Admin');
export const isAgent = () => hasRole('Agent');
export const isUser = () => hasRole('User');
