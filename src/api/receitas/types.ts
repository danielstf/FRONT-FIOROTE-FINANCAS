export type Receita = {
  id: string;
  nome: string;
  valor: number;
  mes: string;
  data: string;
  fixa: boolean;
  numeroParcelas: number | null;
  parcelaAtual: number | null;
  parcelamentoId: string | null;
  criadoEm: string;
};

export type CriarReceitaPayload = {
  nome: string;
  valor: number;
  mes: string;
  fixa?: boolean;
};

export type EditarReceitaPayload = Partial<CriarReceitaPayload>;

export type ListarReceitasParams = {
  mes?: string;
};

export type ExcluirReceitaParams = {
  escopo?: "mes" | "todas";
  mes?: string;
};

export type ListarReceitasResponse = {
  receitas: Receita[];
  total: number;
};

export type OpcoesReceitaResponse = {
  opcoes: string[];
  permiteNomeManual: boolean;
};
