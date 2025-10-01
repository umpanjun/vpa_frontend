// src/api.js
import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://147.50.253.67:3000";

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true; // ส่ง cookie ทุก request

export default axios;
