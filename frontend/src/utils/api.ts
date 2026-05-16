import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const isLocalhost = API_URL.startsWith("127.0.0.1") || API_URL.startsWith("localhost");
const protocol = isLocalhost ? "http" : "https";

const api = axios.create({
  baseURL: `${protocol}://${API_URL}`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await api.post("/auth/token/refresh/", { refresh: refreshToken });
          const newAccessToken = response.data.access;
          localStorage.setItem("accessToken", newAccessToken);

          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          return Promise.reject(new Error("Session expired. Please login again."));
        }
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(new Error("No refresh token available. Please login again."));
      }
    }

    // **DRY descriptive error messages**
    if (!error.response) {
      // Network or server is down
      return Promise.reject(new Error("Network error: Unable to reach server"));
    } else {
      // Server responded with a status code  
      return Promise.reject(error.response.data);
    }
  }
);

export default api;