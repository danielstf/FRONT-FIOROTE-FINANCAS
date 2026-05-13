import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../api/auth/auth-api";
import type {
  AtualizarPerfilPayload,
  CadastroUsuarioPayload,
  LoginGooglePayload,
  LoginPayload,
  LoginResponse,
} from "../api/auth/types";

const storageKey = "fiorote-financas-auth";

type AuthContextValue = {
  session: LoginResponse | null;
  login: (payload: LoginPayload) => Promise<void>;
  loginGoogle: (payload: LoginGooglePayload) => Promise<void>;
  cadastrar: (payload: CadastroUsuarioPayload) => Promise<void>;
  atualizarPerfil: (payload: AtualizarPerfilPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredSession() {
  const saved = localStorage.getItem(storageKey);

  if (!saved) return null;

  try {
    return JSON.parse(saved) as LoginResponse;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<LoginResponse | null>(getStoredSession);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      async login(payload) {
        const data = await authApi.login(payload);
        localStorage.setItem(storageKey, JSON.stringify(data));
        setSession(data);
      },
      async loginGoogle(payload) {
        const data = await authApi.loginGoogle(payload);
        localStorage.setItem(storageKey, JSON.stringify(data));
        setSession(data);
      },
      async cadastrar(payload) {
        await authApi.criarUsuario(payload);
      },
      async atualizarPerfil(payload) {
        const data = await authApi.atualizarPerfil(payload);

        setSession((currentSession) => {
          if (!currentSession) return currentSession;

          const nextSession = {
            ...currentSession,
            usuario: data.usuario,
          };

          localStorage.setItem(storageKey, JSON.stringify(nextSession));

          return nextSession;
        });
      },
      logout() {
        localStorage.removeItem(storageKey);
        setSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
