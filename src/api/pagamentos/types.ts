export type PagamentoStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "REFUNDED";

export type PremiumStatusResponse = {
  plano: "FREE" | "PREMIUM";
  premium: boolean;
  exibirAnuncios: boolean;
  ultimoPagamento: {
    id: string;
    status: PagamentoStatus;
    valor: number;
    checkoutUrl: string | null;
    criadoEm: string;
    atualizadoEm: string;
  } | null;
};

export type CheckoutPremiumResponse = {
  pagamentoId: string;
  preferenceId: string;
  checkoutUrl: string | null;
  sandboxCheckoutUrl?: string | null;
};
