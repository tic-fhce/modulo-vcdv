import axios from "axios";

let urlBase = "https://localhost:9000/api/token";

export function Api() {

    const headers = {
        "Content-Type": "application/json"
    };

    const api = axios.create({
        baseURL: urlBase,
        headers: headers,
    });

    api.interceptors.response.use(response => response, error => {
        if (error.response && error.response.status === 401) {
            // Optional: Redirect to login, clear local storage, etc.
            console.error("Unauthorized; redirecting to login.");
        }
        return Promise.reject(error);
    });

    return api;
}
