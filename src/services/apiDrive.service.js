import axios from "axios";

let urlBase = "http://localhost:3000";

export function Api() {
  let token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

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
