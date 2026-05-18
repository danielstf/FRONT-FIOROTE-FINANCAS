import { api } from "../client";
import type { AdminResumoResponse } from "./types";

export const adminApi = {
  async resumo() {
    const { data } = await api.get<AdminResumoResponse>("/admin/resumo");
    return data;
  },
};
