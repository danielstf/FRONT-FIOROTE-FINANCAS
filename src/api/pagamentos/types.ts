export type PagamentoStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "REFUNDED";

export type PremiumCheckoutTipo = "MENSAL" | "RECORRENTE";

export type PremiumStatusResponse = {
  plano: "FREE" | "PREMIUM";
  premium: boolean;
  exibirAnuncios: boolean;
  premiumExpiraEm: string | null;
  premiumDiasRestantes: number;
  ultimoPagamento: {
    id: string;
    status: PagamentoStatus;
    valor: number;
    checkoutUrl: string | null;
    tipo: "CHECKOUT" | "ASSINATURA";
    assinaturaStatus: string | null;
    assinaturaId: string | null;
    canceladoEm: string | null;
    criadoEm: string;
    atualizadoEm: string;
  } | null;
};

export type CheckoutPremiumResponse = {
  pagamentoId: string;
  preferenceId?: string | null;
  preapprovalId: string | null;
  checkoutUrl: string | null;
  sandboxCheckoutUrl?: string | null;
};

export type CancelarPremiumResponse = {
  usuario: {
    id: string;
    nome: string;
    email: string;
    role: "ADMIN" | "USER";
    plano: "FREE" | "PREMIUM";
    premiumExpiraEm?: string | null;
    temSenha: boolean;
  };
};
