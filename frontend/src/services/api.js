import axios from "axios";

const API = axios.create({
  baseURL: "https://consoles-veterans-indication-expires.trycloudflare.com",
});

export default API;