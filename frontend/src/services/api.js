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

export default API;
