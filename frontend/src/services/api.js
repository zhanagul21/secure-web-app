import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://authguard-backend-7mbc.onrender.com/api",
  timeout: 20000,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      return Promise.reject({
        response: {
          data: {
            message: "Сервер баяу жауап берді. Қайта көріңіз.",
          },
        },
      });
    }

    if (!error.response) {
      return Promise.reject({
        response: {
          data: {
            message: "Серверге қосылу мүмкін болмады. Қайта көріңіз.",
          },
        },
      });
    }

    return Promise.reject(error);
  }
);

export default API;