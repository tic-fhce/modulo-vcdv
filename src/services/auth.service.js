import { Api } from './api.service';

// Función para iniciar sesión y obtener el token JWT
export default {
    login(credenciales){
        return Api().post("/auth/login", credenciales);
    },
    registro(datos){
        return Api().post("/auth/register", datos);
    },
    // Función para cerrar sesión y borrar el token JWT
    logout() {
        localStorage.removeItem('access_token');
    },
    // Función para verificar si el usuario está autenticado
    isAuthenticated() {
        const token = localStorage.getItem('access_token');
        return !!token;
    }
}

