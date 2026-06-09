import { api } from "../client";
import type { AdminBuscaUsuarioResponse, AdminResumoResponse } from "./types";

export const adminApi = {
  async resumo() {
    const { data } = await api.get<AdminResumoResponse>("/admin/resumo");
    return data;
  },

  async buscarUsuario(q: string) {
    const { data } = await api.get<AdminBuscaUsuarioResponse>("/admin/usuarios/busca", {
      params: { q },
    });
    return data;
  },
};
