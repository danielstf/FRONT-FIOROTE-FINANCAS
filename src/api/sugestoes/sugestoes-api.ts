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
};
