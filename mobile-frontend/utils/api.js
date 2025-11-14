import axios from "axios";
import { getAuthData } from "./auth";
import { Platform } from "react-native";
const api = axios.create({
  baseURL: Platform.OS === 'web' ? "http://localhost:8000/" : "http://10.0.2.2:8000/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(async (config) => {
  const { token } = await getAuthData();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;
