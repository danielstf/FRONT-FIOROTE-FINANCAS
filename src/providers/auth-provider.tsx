import {
  useCallback,
  createContext,
  useContext,
  useEffect,
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
const perfilStorageKey = "fiorote-financas-perfil-id";

type AuthContextValue = {
  session: LoginResponse | null;
  authLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  loginGoogle: (payload: LoginGooglePayload) => Promise<void>;
  cadastrar: (payload: CadastroUsuarioPayload) => Promise<void>;
  atualizarPerfil: (payload: AtualizarPerfilPayload) => Promise<void>;
  atualizarUsuarioSessao: (usuario: LoginResponse["usuario"]) => void;
  perfilFinanceiroId: string | null;
  selecionarPerfilFinanceiro: (perfilId: string | null) => void;
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
  const [perfilFinanceiroId, setPerfilFinanceiroId] = useState<string | null>(() => {
    return localStorage.getItem(perfilStorageKey);
  });
  // true enquanto buscarPerfil está em andamento; garante que componentes só
  // carreguem dados após o perfilFinanceiroId estar estabilizado pelo AppLayout
  const [authLoading, setAuthLoading] = useState(() => !!getStoredSession());

  useEffect(() => {
    if (!session) {
      setAuthLoading(false);
      return;
    }

    let ignore = false;
    setAuthLoading(true);

    authApi
      .buscarPerfil()
      .then((data) => {
        if (ignore) return;

        setSession((currentSession) => {
          if (!currentSession) return currentSession;

          const nextSession = {
            ...currentSession,
            usuario: data.usuario,
          };

          localStorage.setItem(storageKey, JSON.stringify(nextSession));

          return nextSession;
        });
      })
      .catch(() => {
        // Mantem a sessao atual se o refresh do perfil falhar momentaneamente.
      })
      .finally(() => {
        if (!ignore) setAuthLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [session?.token]);

  const selecionarPerfilFinanceiro = useCallback((perfilId: string | null) => {
    setPerfilFinanceiroId(perfilId);

    if (perfilId) {
      localStorage.setItem(perfilStorageKey, perfilId);
    } else {
      localStorage.removeItem(perfilStorageKey);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(perfilStorageKey);
    setPerfilFinanceiroId(null);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      authLoading,
      async login(payload) {
        setAuthLoading(true);
        const data = await authApi.login(payload);
        localStorage.setItem(storageKey, JSON.stringify(data));
        setSession(data);
      },
      async loginGoogle(payload) {
        setAuthLoading(true);
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
      atualizarUsuarioSessao(usuario) {
        setSession((currentSession) => {
          if (!currentSession) return currentSession;

          const nextSession = {
            ...currentSession,
            usuario,
          };

          localStorage.setItem(storageKey, JSON.stringify(nextSession));

          return nextSession;
        });
      },
      perfilFinanceiroId,
      selecionarPerfilFinanceiro,
      logout,
    }),
    [perfilFinanceiroId, session, authLoading, selecionarPerfilFinanceiro, logout],
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
