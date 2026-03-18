import axios from "axios";

const API = axios.create({
  baseURL: "https://secure-web-app-x2nn.onrender.com/api",
});

export default API;