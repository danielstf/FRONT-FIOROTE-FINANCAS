import { api } from "../client";
import type { ResumoFinanceiroResponse } from "./types";

export const dashboardApi = {
  async resumoFinanceiro(params: { mes: string; meses?: number }) {
    const { data } = await api.get<ResumoFinanceiroResponse>(
      "/dashboard/resumo-financeiro",
      { params },
    );

    return data;
  },
};
