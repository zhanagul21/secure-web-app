import axios from "axios";

const API = axios.create({
  baseURL: "https://authguard-backend-7mbc.onrender.com/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;