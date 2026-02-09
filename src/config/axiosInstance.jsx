import axios from "axios";
import { baseUrl } from "./api";

export const apiInstance = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized or 403 Forbidden
      if (error.response.status === 401 || error.response.status === 403) {
        // Clear token and redirect to login
        localStorage.removeItem("token");
        // Only redirect if not already on login page
        if (window.location.pathname !== "/" && window.location.pathname !== "/otp-send") {
          window.location.href = "/";
        }
      }
    }
    return Promise.reject(error);
  }
);