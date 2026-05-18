import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const savedSession = localStorage.getItem("fiorote-financas-auth");
  const perfilFinanceiroId = localStorage.getItem("fiorote-financas-perfil-id");

  if (perfilFinanceiroId) {
    config.headers["X-Perfil-Financeiro-Id"] = perfilFinanceiroId;
  } else {
    delete config.headers["X-Perfil-Financeiro-Id"];
  }

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
