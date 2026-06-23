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

// Sentinel: indica que há sessão ativa via cookie httpOnly — o token real
// não é acessível por JS, mas a presença deste valor sinaliza "autenticado".
const COOKIE_SESSION_SENTINEL = "cookie-session";

type StoredAuth = { usuario: LoginResponse["usuario"] };

function getStoredSession(): LoginResponse | null {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as StoredAuth;
    if (!parsed.usuario) return null;
    // Reconstrói a sessão usando o sentinel — o cookie real é enviado
    // automaticamente pelo browser nas requisições.
    return { token: COOKIE_SESSION_SENTINEL, usuario: parsed.usuario };
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
}

function saveUsuario(usuario: LoginResponse["usuario"]) {
  localStorage.setItem(storageKey, JSON.stringify({ usuario }));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<LoginResponse | null>(getStoredSession);
  const [perfilFinanceiroId, setPerfilFinanceiroId] = useState<string | null>(() =>
    localStorage.getItem(perfilStorageKey),
  );
  // Começa em false: dados em cache do localStorage já estão disponíveis.
  // Só vai para true durante o fluxo de login ativo para bloquear a UI.
  const [authLoading, setAuthLoading] = useState(false);

  // Atualiza dados do usuário em background via cookie — não bloqueia a UI.
  useEffect(() => {
    if (!session) return;

    let ignore = false;

    authApi
      .buscarPerfil()
      .then((data) => {
        if (ignore) return;
        const usuario = data.usuario;
        saveUsuario(usuario);
        setSession((s) => (s ? { ...s, usuario } : s));
      })
      .catch(() => {
        // Mantém a sessão em cache se o refresh falhar.
      })
      .finally(() => {
        // Garante que authLoading seja false após login (que o define como true).
        if (!ignore) setAuthLoading(false);
      });

    return () => { ignore = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token]);

  const selecionarPerfilFinanceiro = useCallback((perfilId: string | null) => {
    setPerfilFinanceiroId(perfilId);
    if (perfilId) {
      localStorage.setItem(perfilStorageKey, perfilId);
    } else {
      localStorage.removeItem(perfilStorageKey);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignora falha de rede */ }
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
        try {
          const data = await authApi.login(payload);
          saveUsuario(data.usuario);
          setSession({ token: COOKIE_SESSION_SENTINEL, usuario: data.usuario });
          // authLoading vai para false no finally do useEffect após buscarPerfil()
        } catch (e) {
          setAuthLoading(false);
          throw e;
        }
      },
      async loginGoogle(payload) {
        setAuthLoading(true);
        try {
          const data = await authApi.loginGoogle(payload);
          saveUsuario(data.usuario);
          setSession({ token: COOKIE_SESSION_SENTINEL, usuario: data.usuario });
        } catch (e) {
          setAuthLoading(false);
          throw e;
        }
      },
      async cadastrar(payload) {
        await authApi.criarUsuario(payload);
      },
      async atualizarPerfil(payload) {
        const data = await authApi.atualizarPerfil(payload);
        saveUsuario(data.usuario);
        setSession((s) => (s ? { ...s, usuario: data.usuario } : s));
      },
      atualizarUsuarioSessao(usuario) {
        saveUsuario(usuario);
        setSession((s) => (s ? { ...s, usuario } : s));
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
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}

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
