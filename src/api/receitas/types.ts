export type Receita = {
  id: string;
  nome: string;
  valor: number;
  mes: string;
  data: string;
  criadoEm: string;
};

export type CriarReceitaPayload = {
  nome: string;
  valor: number;
  mes: string;
};

export type EditarReceitaPayload = Partial<CriarReceitaPayload>;

export type ListarReceitasParams = {
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
