export type FormaPagamentoDespesa =
  | "DINHEIRO"
  | "CARTAO_CREDITO"
  | "CARTAO_DEBITO"
  | "VALE_ALIMENTACAO"
  | "VALE_REFEICAO"
  | "BOLETO";

export type CartaoCreditoResumo = {
  id: string;
  nome: string;
};

export type Despesa = {
  id: string;
  nome: string;
  valor: number;
  categoria: string | null;
  formaPagamento: FormaPagamentoDespesa;
  cartaoCreditoId: string | null;
  cartaoCredito: CartaoCreditoResumo | null;
  mesReferencia: string;
  dataVencimento: string | null;
  dataPagamento: string | null;
  paga: boolean;
  fixa: boolean;
  numeroParcelas: number | null;
  parcelaAtual: number | null;
  parcelamentoId: string | null;
  vencida: boolean;
  alerta: string | null;
  criadoEm: string;
};

export type CriarDespesaPayload = {
  nome: string;
  valor: number;
  categoria?: string | null;
  formaPagamento: FormaPagamentoDespesa;
  cartaoCreditoId?: string | null;
  mes?: string | null;
  dataVencimento?: string | null;
  fixa?: boolean;
  numeroParcelas?: number;
};

export type EditarDespesaPayload = Partial<CriarDespesaPayload>;

export type ListarDespesasParams = {
  mes?: string;
  formaPagamento?: FormaPagamentoDespesa;
  cartaoCreditoId?: string;
  somenteCartao?: boolean;
  somenteVencidas?: boolean;
  paga?: boolean;
};

export type ExcluirDespesaParams = {
  excluirParcelas?: boolean;
  escopo?: "mes" | "todas";
  mes?: string;
};

export type CriarDespesaResponse = {
  despesas: Despesa[];
};

export type ListarDespesasResponse = {
  despesas: Despesa[];
  total: number;
  totalPendente: number;
  totalPago: number;
  contasVencidas: number;
};

export type OpcoesDespesaResponse = {
  categorias: string[];
  formasPagamento: FormaPagamentoDespesa[];
  permiteCategoriaManual: boolean;
};
