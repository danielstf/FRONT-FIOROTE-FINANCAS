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
