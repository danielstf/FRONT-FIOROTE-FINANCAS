import { api } from "../client";
import type {
  ApiMessageResponse,
  AtualizarPerfilPayload,
  AtualizarPerfilResponse,
  CadastroUsuarioPayload,
  LoginGooglePayload,
  LoginPayload,
  LoginResponse,
  RedefinirSenhaPayload,
  SolicitarRedefinicaoSenhaPayload,
  TrocarSenhaPayload,
} from "./types";

export const authApi = {
  async criarUsuario(payload: CadastroUsuarioPayload) {
    const { data } = await api.post<ApiMessageResponse>("/usuarios", payload);
    return data;
  },

  async login(payload: LoginPayload) {
    const { data } = await api.post<LoginResponse>("/login", payload);
    return data;
  },

  async loginGoogle(payload: LoginGooglePayload) {
    const { data } = await api.post<LoginResponse>("/login/google", payload);
    return data;
  },

  async solicitarRedefinicaoSenha(payload: SolicitarRedefinicaoSenhaPayload) {
    const { data } = await api.post<ApiMessageResponse>(
      "/esqueci-senha",
      payload,
    );
    return data;
  },

  async redefinirSenha(payload: RedefinirSenhaPayload) {
    const { data } = await api.post<ApiMessageResponse>(
      "/redefinir-senha",
      payload,
    );
    return data;
  },

  async atualizarPerfil(payload: AtualizarPerfilPayload) {
    const { data } = await api.patch<AtualizarPerfilResponse>(
      "/usuarios/perfil",
      payload,
    );
    return data;
  },

  async trocarSenha(payload: TrocarSenhaPayload) {
    const { data } = await api.patch<ApiMessageResponse>(
      "/usuarios/senha",
      payload,
    );
    return data;
  },
};
