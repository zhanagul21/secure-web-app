import axios from "axios";

const API = axios.create({
  baseURL: "https://brunswick-training-drives-powered.trycloudflare.com",
});

export default API;