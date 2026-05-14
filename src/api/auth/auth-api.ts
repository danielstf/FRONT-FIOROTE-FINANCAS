import { api } from "../client";
import type {
  ApiMessageResponse,
  AtualizarPerfilPayload,
  AtualizarPerfilResponse,
  BuscarPerfilResponse,
  CadastroUsuarioPayload,
  LoginGooglePayload,
  LoginPayload,
  LoginResponse,
  RedefinirSenhaPayload,
  SolicitarRedefinicaoSenhaPayload,
  TrocarSenhaPayload,
  TrocarSenhaResponse,
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

  async buscarPerfil() {
    const { data } = await api.get<BuscarPerfilResponse>("/usuarios/perfil");
    return data;
  },

  async trocarSenha(payload: TrocarSenhaPayload) {
    const { data } = await api.patch<TrocarSenhaResponse>(
      "/usuarios/senha",
      payload,
    );
    return data;
  },
};
