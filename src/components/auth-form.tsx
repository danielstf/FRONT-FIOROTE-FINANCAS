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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
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

    if (window.google) {
      renderGoogleButton();
      return;
    }

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
    <Card className="w-full overflow-hidden rounded-2xl border-white/10 bg-[#080f1d]/95 shadow-2xl shadow-black/40">
      <div className="h-px bg-linear-to-r from-cyan-400/60 via-blue-500/80 to-emerald-400/60" />
      <CardHeader className="space-y-6 p-5 pb-4 sm:p-7 sm:pb-4">
        <div className="grid grid-cols-2 rounded-xl border border-white/8 bg-black/30 p-1">
          <Button
            asChild
            variant="ghost"
            className={cn(
              "h-10 rounded-lg text-slate-500 transition-all hover:bg-white/5 hover:text-slate-300",
              isLogin && "bg-white/10 text-white shadow-sm shadow-black/30 hover:bg-white/10 hover:text-white border border-white/12",
            )}
          >
            <Link to="/login">Entrar</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className={cn(
              "h-10 rounded-lg text-slate-500 transition-all hover:bg-white/5 hover:text-slate-300",
              !isLogin && "bg-white/10 text-white shadow-sm shadow-black/30 hover:bg-white/10 hover:text-white border border-white/12",
            )}
          >
            <Link to="/cadastro">Cadastro</Link>
          </Button>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-[1.75rem] font-semibold text-white">{title}</CardTitle>
          <CardDescription className="text-sm leading-6 text-slate-400">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0 sm:p-7 sm:pt-0">
        <div className="mb-4 grid gap-3">
          {googleClientId ? (
            <div ref={googleButtonRef} className="min-h-10 w-full" />
          ) : (
            <Button className="h-11 w-full border-white/10 bg-slate-950 text-slate-300" disabled variant="outline">
              Google não configurado
            </Button>
          )}
        </div>
        <div className="mb-5 flex items-center gap-3 text-xs text-slate-500">
          <span className="h-px flex-1 bg-white/10" />
          <span className="shrink-0">ou continue com email</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-widest text-slate-400" htmlFor="nome">Nome</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="nome"
                  value={nome}
                  onChange={(event) => setNome(capitalizeNameInput(event.target.value))}
                  placeholder="Seu nome"
                  className="h-12 rounded-lg border-white/10 bg-slate-950/80 pl-10 text-white placeholder:text-slate-600 focus:border-cyan-300/70 focus:ring-cyan-300/15"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-slate-400" htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="usuario@email.com"
                className="h-12 rounded-lg border-white/10 bg-slate-950/80 pl-10 text-white placeholder:text-slate-600 focus:border-cyan-300/70 focus:ring-cyan-300/15"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-xs font-semibold uppercase tracking-widest text-slate-400" htmlFor="senha">Senha</Label>
              {isLogin && (
                <Link
                  className="text-xs font-medium text-cyan-300 hover:text-cyan-200 hover:underline"
                  to="/esqueci-senha"
                >
                  Esqueci minha senha
                </Link>
              )}
            </div>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="senha"
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Sua senha"
                className="h-12 rounded-lg border-white/10 bg-slate-950/80 pl-10 pr-11 text-white placeholder:text-slate-600 focus:border-cyan-300/70 focus:ring-cyan-300/15"
                minLength={isLogin ? 1 : 6}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-white/10 hover:text-white"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordHint && (
              <p
                className={cn(
                  "text-xs",
                  senha.length >= 6 ? "text-cyan-300" : "text-slate-500",
                )}
              >
                {passwordHint}
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-200">
              {message}
            </p>
          )}

          <Button type="submit" className="h-12 w-full rounded-lg bg-white text-slate-950 shadow-lg shadow-black/30 hover:bg-cyan-100" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {isLogin ? "Entrar" : "Criar conta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
