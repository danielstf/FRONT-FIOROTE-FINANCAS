export type Usuario = {
  id: string;
  nome: string;
  email: string;
  role: "ADMIN" | "USER";
  plano: "FREE" | "PREMIUM";
};

export type LoginPayload = {
  email: string;
  senha: string;
};

export type LoginGooglePayload = {
  idToken: string;
};

export type CadastroUsuarioPayload = {
  nome: string;
  email: string;
  senha: string;
};

export type SolicitarRedefinicaoSenhaPayload = {
  email: string;
};

export type RedefinirSenhaPayload = {
  token: string;
  senha: string;
};

export type AtualizarPerfilPayload = {
  nome: string;
};

export type AtualizarPerfilResponse = {
  usuario: Usuario;
};

export type TrocarSenhaPayload = {
  senhaAtual: string;
  novaSenha: string;
};

export type LoginResponse = {
  token: string;
  usuario: Usuario;
};

export type ApiMessageResponse = {
  message: string;
};
