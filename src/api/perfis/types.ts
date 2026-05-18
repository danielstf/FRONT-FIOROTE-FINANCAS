export type TemaPerfil = "system" | "light" | "dark";

export type PerfilFinanceiro = {
  id: string;
  nome: string;
  avatar: string;
  tema: TemaPerfil;
  criadoEm: string;
  atualizadoEm: string;
};

export type SalvarPerfilPayload = {
  nome: string;
  avatar: string;
  tema?: TemaPerfil;
};

export type ListarPerfisResponse = {
  perfis: PerfilFinanceiro[];
};
