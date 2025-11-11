// 1. Importamos el CLIENTE central, no creamos un nuevo axios
import apiClient from "../../../shared/infraestructure/services/api.client.js";

export const login = async (username, password) => {
    try {
        const response = await apiClient.get('/users', {
            params: {
                username: username,
                password: password
            }
        });

        if (response.data.length > 0) {
            const user = response.data[0];

            const fakeToken = `fake-jwt-token-for-${user.username}`;
            localStorage.setItem('user-token', fakeToken);

            delete user.password;
            return user;

        } else {
            throw new Error('Usuario o contraseña incorrectos');
        }
    } catch (error) {
        console.error("Error en el login:", error.message);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await apiClient.post('/users', userData);

        return response.data;

    } catch (error) {
        console.error("Error en el registro:", error);
        throw error;
    }
};
export const logout = () => {
    localStorage.removeItem('user-token');
};
