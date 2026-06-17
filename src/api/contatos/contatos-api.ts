import { api } from "../client";
import type { ContatoSuporte, CriarContatoPayload, ListarContatosResponse } from "./types";

export const contatosApi = {
  async criar(payload: CriarContatoPayload) {
    const { data } = await api.post<ContatoSuporte>("/contatos", payload);
    return data;
  },

  async listar() {
    const { data } = await api.get<ListarContatosResponse>("/contatos");
    return data;
  },

  async finalizar(contatoId: string) {
    const { data } = await api.patch<ContatoSuporte>(`/contatos/${contatoId}/finalizar`);
    return data;
  },

  async excluir(contatoId: string) {
    await api.delete(`/contatos/${contatoId}`);
  },
};
