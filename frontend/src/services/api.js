import axios from "axios";
import { apiBaseUrl, apiTimeoutMs } from "./apiConfig";

const API = axios.create({
  baseURL: apiBaseUrl,
  timeout: apiTimeoutMs,
  timeoutErrorMessage: "Сервер ұзақ жауап берді. Қайта байқап көріңіз.",
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise = null;

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise =
        refreshPromise ||
        API.post("/auth/refresh", { refreshToken }).finally(() => {
          refreshPromise = null;
        });

      const refreshResponse = await refreshPromise;
      localStorage.setItem("token", refreshResponse.data.token);
      localStorage.setItem("refreshToken", refreshResponse.data.refreshToken);

      originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
      return API(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return Promise.reject(refreshError);
    }
  }
);

export default API;
