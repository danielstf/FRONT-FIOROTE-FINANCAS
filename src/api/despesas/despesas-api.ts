import { api } from "../client";
import type {
  CriarDespesaPayload,
  CriarDespesaResponse,
  Despesa,
  EditarDespesaPayload,
  ListarDespesasParams,
  ListarDespesasResponse,
  OpcoesDespesaResponse,
} from "./types";

export const despesasApi = {
  async listar(params?: ListarDespesasParams) {
    const { data } = await api.get<ListarDespesasResponse>("/despesas", {
      params,
    });
    return data;
  },

  async listarOpcoes() {
    const { data } = await api.get<OpcoesDespesaResponse>("/despesas/opcoes");
    return data;
  },

  async criar(payload: CriarDespesaPayload) {
    const { data } = await api.post<CriarDespesaResponse>("/despesas", payload);
    return data;
  },

  async obter(despesaId: string) {
    const { data } = await api.get<Despesa>(`/despesas/${despesaId}`);
    return data;
  },

  async editar(despesaId: string, payload: EditarDespesaPayload) {
    const { data } = await api.put<Despesa>(`/despesas/${despesaId}`, payload);
    return data;
  },

  async alterarPagamento(despesaId: string, paga: boolean) {
    const { data } = await api.patch<Despesa>(
      `/despesas/${despesaId}/pagamento`,
      { paga },
    );
    return data;
  },

  async excluir(despesaId: string) {
    await api.delete(`/despesas/${despesaId}`);
  },
};
