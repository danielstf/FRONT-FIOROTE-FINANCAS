import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "../lib/utils";
import { useAuth } from "../providers/auth-provider";
import { getApiErrorMessage } from "../api/errors";
import { capitalizeName, capitalizeNameInput } from "../lib/text";

type AuthMode = "login" | "cadastro";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with";
              theme?: "outline" | "filled_blue" | "filled_black";
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const { login, loginGoogle, cadastrar } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const isLogin = mode === "login";
  const title = isLogin ? "Bem-vindo de volta" : "Criar conta";
  const description = isLogin
    ? "Acesse sua conta para continuar controlando suas finanças."
    : "Informe seus dados para criar uma nova conta.";

  const passwordHint = useMemo(() => {
    if (isLogin) return "";
    if (!senha) return "Mínimo de 6 caracteres.";
    return senha.length >= 6 ? "Senha válida." : "A senha ainda está curta.";
  }, [isLogin, senha]);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;
    const clientId = googleClientId;

    function renderGoogleButton() {
      if (!window.google || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response.credential) {
            setError("Não foi possível obter o token do Google.");
            return;
          }
          setError("");
          setLoading(true);
          try {
            await loginGoogle({ idToken: response.credential });
            navigate("/app", { replace: true });
          } catch (requestError) {
            setError(getApiErrorMessage(requestError));
          } finally {
            setLoading(false);
          }
        },
      });

      googleButtonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        size: "large",
        text: isLogin ? "signin_with" : "signup_with",
        theme: "outline",
        width: googleButtonRef.current.offsetWidth || 320,
      });
    }

    if (window.google) { renderGoogleButton(); return; }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.body.appendChild(script);
  }, [googleClientId, isLogin, loginGoogle, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (isLogin) {
        await login({ email, senha });
        navigate("/app", { replace: true });
        return;
      }
      await cadastrar({ nome: capitalizeName(nome), email, senha });
      setMessage("Cadastro criado com sucesso. Faça login para continuar.");
      setSenha("");
      navigate("/login");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#070e1c]/98 shadow-2xl shadow-black/50">
      {/* Accent line */}
      <div className="h-px bg-linear-to-r from-cyan-400/50 via-blue-500/90 to-emerald-400/50" />

      <div className="p-5 pb-4 sm:p-7 sm:pb-4 space-y-6">
        {/* Tab switcher */}
        <div className="grid grid-cols-2 rounded-xl border border-white/8 bg-black/30 p-1">
          <Link
            to="/login"
            className={cn(
              "flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-all text-slate-500 hover:bg-white/5 hover:text-slate-300",
              isLogin && "bg-white/10 text-white border border-white/12 shadow-sm shadow-black/30 hover:bg-white/10 hover:text-white",
            )}
          >
            Entrar
          </Link>
          <Link
            to="/cadastro"
            className={cn(
              "flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-all text-slate-500 hover:bg-white/5 hover:text-slate-300",
              !isLogin && "bg-white/10 text-white border border-white/12 shadow-sm shadow-black/30 hover:bg-white/10 hover:text-white",
            )}
          >
            Cadastro
          </Link>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h2 className="text-[1.6rem] font-semibold text-white">{title}</h2>
          <p className="text-sm leading-relaxed text-slate-400">{description}</p>
        </div>
      </div>

      <div className="px-5 pb-6 sm:px-7 sm:pb-7 space-y-5">
        {/* Google */}
        <div>
          {googleClientId ? (
            <div ref={googleButtonRef} className="min-h-10 w-full" />
          ) : (
            <button
              disabled
              className="h-11 w-full rounded-xl border border-white/10 bg-white/4 text-sm text-slate-500 cursor-not-allowed"
            >
              Google não configurado
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="h-px flex-1 bg-white/8" />
          <span className="shrink-0">ou continue com email</span>
          <span className="h-px flex-1 bg-white/8" />
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="nome">
                Nome
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(capitalizeNameInput(e.target.value))}
                  placeholder="Seu nome"
                  className="h-12 rounded-xl border-white/10 bg-white/4 pl-10 text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-cyan-400/10 focus-visible:ring-cyan-400/10"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="email">
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@email.com"
                className="h-12 rounded-xl border-white/10 bg-white/4 pl-10 text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-cyan-400/10 focus-visible:ring-cyan-400/10"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="senha">
                Senha
              </Label>
              {isLogin && (
                <Link
                  className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                  to="/esqueci-senha"
                >
                  Esqueci minha senha
                </Link>
              )}
            </div>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
              <Input
                id="senha"
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                className="h-12 rounded-xl border-white/10 bg-white/4 pl-10 pr-11 text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-cyan-400/10 focus-visible:ring-cyan-400/10"
                minLength={isLogin ? 1 : 6}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-600 hover:bg-white/8 hover:text-slate-400 transition-colors"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordHint && (
              <p className={cn("text-xs mt-1", senha.length >= 6 ? "text-cyan-400" : "text-slate-500")}>
                {passwordHint}
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/8 px-3.5 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {message && (
            <div className="flex items-start gap-2.5 rounded-xl border border-cyan-400/20 bg-cyan-400/8 px-3.5 py-3 text-sm text-cyan-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-400/25 disabled:opacity-55 disabled:cursor-not-allowed mt-2"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <ArrowRight className="h-4 w-4" />}
            {isLogin ? "Entrar na conta" : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
