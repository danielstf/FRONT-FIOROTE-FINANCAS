export type CartaoCredito = {
  id: string;
  nome: string;
  cor: number | null;
  criadoEm: string;
};

export type ListarCartoesResponse = {
  cartoes: CartaoCredito[];
};

export type SalvarCartaoPayload = {
  nome: string;
  cor?: number | null;
};
