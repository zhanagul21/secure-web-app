import axios from "axios";

const API = axios.create({
  baseURL: "https://boxes-hitting-respective-looksmart.trycloudflare.com/api",
  timeout: 20000,
});

export default API;