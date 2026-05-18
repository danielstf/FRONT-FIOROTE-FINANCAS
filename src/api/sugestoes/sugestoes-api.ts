import { api } from "../client";
import type {
  CriarSugestaoPayload,
  ListarSugestoesResponse,
  Sugestao,
} from "./types";

export const sugestoesApi = {
  async criar(payload: CriarSugestaoPayload) {
    const { data } = await api.post<Sugestao>("/sugestoes", payload);
    return data;
  },

  async listar() {
    const { data } = await api.get<ListarSugestoesResponse>("/sugestoes");
    return data;
  },

  async finalizar(sugestaoId: string) {
    const { data } = await api.patch<Sugestao>(
      `/sugestoes/${sugestaoId}/finalizar`,
    );
    return data;
  },

  async excluir(sugestaoId: string) {
    await api.delete(`/sugestoes/${sugestaoId}`);
  },
};
