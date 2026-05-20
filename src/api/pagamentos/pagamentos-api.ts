import { api } from "../client";
import type {
  CancelarPremiumResponse,
  CheckoutPremiumResponse,
  PremiumCheckoutTipo,
  PremiumStatusResponse,
} from "./types";

export const pagamentosApi = {
  async consultarPremium() {
    const { data } = await api.get<PremiumStatusResponse>(
      "/pagamentos/premium/status",
    );
    return data;
  },

  async criarCheckoutPremium(tipo: PremiumCheckoutTipo) {
    const { data } = await api.post<CheckoutPremiumResponse>(
      "/pagamentos/premium/checkout",
      { tipo },
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
