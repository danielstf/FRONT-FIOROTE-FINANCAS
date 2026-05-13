import { api } from "../client";
import type {
  CriarReceitaPayload,
  EditarReceitaPayload,
  ListarReceitasParams,
  ListarReceitasResponse,
  OpcoesReceitaResponse,
  Receita,
} from "./types";

export const receitasApi = {
  async listar(params?: ListarReceitasParams) {
    const { data } = await api.get<ListarReceitasResponse>("/receitas", {
      params,
    });
    return data;
  },

  async listarOpcoes() {
    const { data } = await api.get<OpcoesReceitaResponse>("/receitas/opcoes");
    return data;
  },

  async criar(payload: CriarReceitaPayload) {
    const { data } = await api.post<Receita>("/receitas", payload);
    return data;
  },

  async obter(receitaId: string) {
    const { data } = await api.get<Receita>(`/receitas/${receitaId}`);
    return data;
  },

  async editar(receitaId: string, payload: EditarReceitaPayload) {
    const { data } = await api.put<Receita>(`/receitas/${receitaId}`, payload);
    return data;
  },

  async excluir(receitaId: string) {
    await api.delete(`/receitas/${receitaId}`);
  },
};
