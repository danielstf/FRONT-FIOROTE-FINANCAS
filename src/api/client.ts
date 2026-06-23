import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const perfilFinanceiroId = localStorage.getItem("fiorote-financas-perfil-id");

  if (perfilFinanceiroId) {
    config.headers["X-Perfil-Financeiro-Id"] = perfilFinanceiroId;
  } else {
    delete config.headers["X-Perfil-Financeiro-Id"];
  }

  return config;
});
