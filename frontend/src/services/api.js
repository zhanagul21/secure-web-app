import axios from "axios";

const API = axios.create({
  baseURL: "https://requirement-jokes-closed-most.trycloudflare.com",
  timeout: 20000,
});

export default API;