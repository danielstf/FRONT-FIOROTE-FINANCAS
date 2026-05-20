import { api } from "../client";
import type {
  CancelarPremiumResponse,
  CheckoutPremiumResponse,
  PremiumStatusResponse,
} from "./types";

export const pagamentosApi = {
  async consultarPremium() {
    const { data } = await api.get<PremiumStatusResponse>(
      "/pagamentos/premium/status",
    );
    return data;
  },

  async criarCheckoutPremium() {
    const { data } = await api.post<CheckoutPremiumResponse>(
      "/pagamentos/premium/checkout",
    );
    return data;
  },

  async cancelarPremium() {
    const { data } = await api.post<CancelarPremiumResponse>(
      "/pagamentos/premium/cancelar",
    );
    return data;
  },
};
