export type CartaoCredito = {
  id: string;
  nome: string;
  criadoEm: string;
};

export type ListarCartoesResponse = {
  cartoes: CartaoCredito[];
};

export type SalvarCartaoPayload = {
  nome: string;
};
