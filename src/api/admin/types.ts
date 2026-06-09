export type AdminUsuarioDetalhe = {
  id: string;
  nome: string;
  email: string;
  plano: "FREE" | "PREMIUM";
  role: "ADMIN" | "USER";
  criadoEm: string;
  premiumExpiraEm: string | null;
  exibirAnuncios: boolean;
  loginGoogle: boolean;
  contagens: {
    despesas: number;
    receitas: number;
    perfisFinanceiros: number;
    cartoesCredito: number;
    pagamentosPremium: number;
  };
  pagamentos: Array<{
    id: string;
    tipo: string;
    status: string;
    valor: number;
    criadoEm: string;
  }>;
};

export type AdminBuscaUsuarioResponse = {
  usuarios: AdminUsuarioDetalhe[];
};

export type AdminResumoResponse = {
  usuarios: {
    total: number;
    premium: number;
    free: number;
  };
  perfis: {
    total: number;
  };
  movimentos: {
    receitas: number;
    despesas: number;
  };
  simultaneos: {
    atual: number;
    janelaMinutos: number;
    observacao: string;
  };
  ultimosUsuarios: Array<{
    id: string;
    nome: string;
    email: string;
    plano: "FREE" | "PREMIUM";
    role: "ADMIN" | "USER";
    criadoEm: string;
  }>;
};
