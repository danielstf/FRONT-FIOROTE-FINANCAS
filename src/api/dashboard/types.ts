export type MovimentoMensal = {
  mes: string;
  receitas: number;
  despesas: number;
  saldoInicial: number;
  saldoFinal: number;
};

export type CategoriaDespesaResumo = {
  categoria: string;
  total: number;
};

export type MaiorGastoResumo = {
  id: string;
  nome: string;
  categoria: string;
  valor: number;
};

export type ResumoFinanceiroResponse = {
  mes: string;
  resumo: {
    saldoInicial: number;
    totalReceitas: number;
    totalDespesas: number;
    totalDespesasPagas: number;
    totalDespesasPendentes: number;
    saldoFinal: number;
    contasVencidas: number;
  };
  graficos: {
    pizzaDespesasPorCategoria: CategoriaDespesaResumo[];
    barrasMaioresGastos: MaiorGastoResumo[];
    linhaEvolucaoFinanceira: MovimentoMensal[];
    linhaEvolucaoGastos: Array<{
      mes: string;
      totalDespesas: number;
    }>;
  };
};
