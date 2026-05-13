import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const savedSession = localStorage.getItem("fiorote-financas-auth");

  if (!savedSession) return config;

  try {
    const { token } = JSON.parse(savedSession) as { token?: string };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    localStorage.removeItem("fiorote-financas-auth");
  }

  return config;
});
