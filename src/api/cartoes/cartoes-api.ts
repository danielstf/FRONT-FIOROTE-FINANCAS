import { api } from "../client";
import type { CartaoCredito, ListarCartoesResponse, SalvarCartaoPayload } from "./types";

export const cartoesApi = {
  async listar() {
    const { data } = await api.get<ListarCartoesResponse>("/cartoes");
    return data;
  },

  async criar(payload: SalvarCartaoPayload) {
    const { data } = await api.post<CartaoCredito>("/cartoes", payload);
    return data;
  },

  async editar(cartaoId: string, payload: SalvarCartaoPayload) {
    const { data } = await api.put<CartaoCredito>(`/cartoes/${cartaoId}`, payload);
    return data;
  },

  async excluir(cartaoId: string) {
    await api.delete(`/cartoes/${cartaoId}`);
  },
};
