import axios from "axios";

const API = axios.create({
  baseURL: "https://ratio-some-plug-barriers.trycloudflare.com/api",
});

export default API;