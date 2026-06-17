import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, Save } from "lucide-react";
import { authApi } from "../../../api/auth/auth-api";
import { getApiErrorMessage } from "../../../api/errors";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export function RedefinirSenhaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await authApi.redefinirSenha({ token, senha });
      setMessage(response.message);
      setSenha("");
      window.setTimeout(() => navigate("/login"), 1200);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#070e1c]/98 shadow-2xl shadow-black/50">
      <div className="h-px bg-linear-to-r from-cyan-400/50 via-blue-500/90 to-emerald-400/50" />

      <div className="p-5 pb-0 sm:p-7 sm:pb-0">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-white/6 hover:text-slate-300 -ml-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </Link>
      </div>

      <div className="px-5 pt-5 pb-6 sm:px-7 sm:pb-7 space-y-6">
        <div className="space-y-1.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h2 className="text-[1.6rem] font-semibold text-white">Redefinir senha</h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Crie uma nova senha com no mínimo 6 caracteres.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="senha">
              Nova senha
            </Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
              <Input
                id="senha"
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Nova senha"
                className="h-12 rounded-xl border-white/10 bg-white/4 pl-10 pr-11 text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-cyan-400/10 focus-visible:ring-cyan-400/10"
                minLength={6}
                disabled={!token}
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
          </div>

          {!token && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-3.5 py-3 text-sm text-red-300">
              Link inválido. Solicite uma nova redefinição de senha.
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-3.5 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/8 px-3.5 py-3 text-sm text-cyan-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-400/25 disabled:opacity-55 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar nova senha
          </button>
        </form>
      </div>
    </div>
  );
}
