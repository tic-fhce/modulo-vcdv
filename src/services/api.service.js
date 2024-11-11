import axios from "axios";

// let urlBase = "http://192.168.0.10:8081";
let urlBase = "http://localhost:8081";

export function Api() {
  let token = localStorage.getItem("access_token"); // Assuming JWT token in localStorage

  const api = axios.create({
    baseURL: urlBase,
    headers: {
      //"Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "", // Include Authorization header with token if available
    },
  });

  // Response interceptor for handling authentication errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("access_token");
        //window.location.href = "/"; // Redirect to login on 401
      }
      return Promise.reject(error);
    }
  );

  return api;
}