import { api } from "../client";
import type {
  ListarPerfisResponse,
  PerfilFinanceiro,
  SalvarPerfilPayload,
} from "./types";

export const perfisApi = {
  async listar() {
    const { data } = await api.get<ListarPerfisResponse>("/perfis");
    return data;
  },

  async criar(payload: SalvarPerfilPayload) {
    const { data } = await api.post<PerfilFinanceiro>("/perfis", payload);
    return data;
  },

  async editar(perfilId: string, payload: Partial<SalvarPerfilPayload>) {
    const { data } = await api.put<PerfilFinanceiro>(`/perfis/${perfilId}`, payload);
    return data;
  },

  async excluir(perfilId: string) {
    await api.delete(`/perfis/${perfilId}`);
  },
};
