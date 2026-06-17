import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, Send } from "lucide-react";
import { authApi } from "../../../api/auth/auth-api";
import { getApiErrorMessage } from "../../../api/errors";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await authApi.solicitarRedefinicaoSenha({ email });
      setMessage(response.message);
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
            <Mail className="h-5 w-5" />
          </div>
          <h2 className="text-[1.6rem] font-semibold text-white">Esqueci minha senha</h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Informe seu email para receber as instruções de redefinição.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-400/25 disabled:opacity-55 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar instruções
          </button>
        </form>
      </div>
    </div>
  );
}
