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
  const [authLoading, setAuthLoading] = useState(() => !!getStoredSession());

  // Atualiza os dados do usuário na sessão via cookie (sem precisar do token).
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
        const usuario = data.usuario;
        saveUsuario(usuario);
        setSession((s) => (s ? { ...s, usuario } : s));
      })
      .catch(() => {
        // Mantém a sessão atual se o refresh falhar momentaneamente.
      })
      .finally(() => {
        if (!ignore) setAuthLoading(false);
      });

    return () => { ignore = true; };
  // Roda uma vez por montagem — o sentinel não muda, então nunca re-dispara
  // desnecessariamente. Se o token expirar, o servidor retorna 401 e o catch
  // acima protege silenciosamente (o usuário vê o erro ao tentar uma ação).
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
        const data = await authApi.login(payload);
        saveUsuario(data.usuario);
        setSession({ token: COOKIE_SESSION_SENTINEL, usuario: data.usuario });
      },
      async loginGoogle(payload) {
        setAuthLoading(true);
        const data = await authApi.loginGoogle(payload);
        saveUsuario(data.usuario);
        setSession({ token: COOKIE_SESSION_SENTINEL, usuario: data.usuario });
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
