import {
  CreditCard,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { cartoesApi } from "../../api/cartoes/cartoes-api";
import type { CartaoCredito } from "../../api/cartoes/types";
import { getApiErrorMessage } from "../../api/errors";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { normalizeRequiredText, toUppercaseText } from "../../lib/text";
import { useAuth } from "../../providers/auth-provider";

export function CartoesPage() {
  const { perfilFinanceiroId } = useAuth();
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [nome, setNome] = useState("");
  const [editando, setEditando] = useState<CartaoCredito | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function carregarCartoes() {
    setError("");
    setLoading(true);
    try {
      const data = await cartoesApi.listar();
      setCartoes(data.cartoes.map((c) => ({ ...c, nome: toUppercaseText(c.nome) })));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function salvarCartao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const nomeNormalizado = normalizeRequiredText(nome);
      if (!nomeNormalizado) { toast.error("Informe o nome do cartão."); return; }
      if (editando) {
        await cartoesApi.editar(editando.id, { nome: nomeNormalizado });
        toast.success("Cartão atualizado com sucesso.");
      } else {
        await cartoesApi.criar({ nome: nomeNormalizado });
        toast.success("Cartão cadastrado com sucesso.");
      }
      setNome("");
      setEditando(null);
      await carregarCartoes();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function excluirCartao(cartao: CartaoCredito) {
    const confirmed = window.confirm(`Excluir o cartão "${cartao.nome}"?`);
    if (!confirmed) return;
    setError("");
    setBusyId(cartao.id);
    try {
      await cartoesApi.excluir(cartao.id);
      toast.success("Cartão excluído com sucesso.");
      await carregarCartoes();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  }

  function iniciarEdicao(cartao: CartaoCredito) {
    setEditando(cartao);
    setNome(toUppercaseText(cartao.nome));
    setError("");
  }

  function cancelarEdicao() {
    setEditando(null);
    setNome("");
  }

  useEffect(() => {
    void carregarCartoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfilFinanceiroId]);

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <WalletCards className="h-4.5 w-4.5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Cartões de crédito</h1>
          <p className="text-xs text-muted-foreground">Cadastre para vincular em despesas</p>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        {/* ── Form ── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {editando ? <Pencil className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </div>
            <p className="text-sm font-semibold">{editando ? "Editar cartão" : "Novo cartão"}</p>
          </div>
          <div className="p-5">
            <form className="grid gap-4" onSubmit={salvarCartao}>
              <div className="space-y-2">
                <Label htmlFor="nome-cartao" className="text-xs font-medium text-muted-foreground">
                  Nome do cartão
                </Label>
                <Input
                  id="nome-cartao"
                  value={nome}
                  onChange={(e) => setNome(toUppercaseText(e.target.value))}
                  placeholder="Ex: NUBANK, INTER, ITAÚ"
                  required
                  className="h-10"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="h-10 flex-1 gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editando ? "Salvar" : "Cadastrar"}
                </Button>
                {editando && (
                  <Button type="button" variant="outline" onClick={cancelarEdicao} className="h-10 gap-2">
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ── List ── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCard className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm font-semibold">Cartões cadastrados</p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {cartoes.length}
            </span>
          </div>

          {loading && (
            <div className="flex items-center gap-2.5 p-5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
            </div>
          )}

          {!loading && cartoes.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2.5 py-14 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Nenhum cartão cadastrado.</p>
                <p className="mt-1 text-xs text-muted-foreground">Cadastre seu primeiro cartão para usar em despesas.</p>
              </div>
            </div>
          )}

          {!loading && cartoes.length > 0 && (
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              {cartoes.map((cartao, index) => {
                const gradients = [
                  "from-blue-600 via-blue-500 to-blue-400",
                  "from-violet-600 via-violet-500 to-violet-400",
                  "from-rose-600 via-rose-500 to-rose-400",
                  "from-emerald-600 via-emerald-500 to-emerald-400",
                  "from-amber-600 via-amber-500 to-amber-400",
                  "from-cyan-600 via-cyan-500 to-cyan-400",
                  "from-indigo-600 via-indigo-500 to-indigo-400",
                  "from-pink-600 via-pink-500 to-pink-400",
                ];
                const gradient = gradients[index % gradients.length];
                return (
                <div
                  key={cartao.id}
                  className={`group relative aspect-[1.586/1] overflow-hidden rounded-2xl bg-linear-to-br ${gradient} p-5 text-white shadow-md`}
                >
                  {/* Decorative circles */}
                  <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
                  <div aria-hidden className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/8" />

                  {/* Chip — EMV realista */}
                  <div className="relative h-7 w-10 overflow-hidden rounded-md bg-amber-300/90 shadow-sm">
                    <div className="absolute inset-x-0 top-[33%] h-px bg-amber-700/40" />
                    <div className="absolute inset-x-0 top-[66%] h-px bg-amber-700/40" />
                    <div className="absolute inset-y-0 left-[42%] w-px bg-amber-700/30" />
                  </div>

                  {/* Credit card icon */}
                  <div className="absolute right-5 top-5 opacity-25">
                    <CreditCard className="h-7 w-7" />
                  </div>

                  {/* Actions — visible on hover */}
                  <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/35"
                      title="Editar"
                      type="button"
                      onClick={() => iniciarEdicao(cartao)}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-red-500/70 disabled:opacity-50"
                      title="Excluir"
                      type="button"
                      disabled={busyId === cartao.id}
                      onClick={() => excluirCartao(cartao)}
                    >
                      {busyId === cartao.id
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Trash2 className="h-3 w-3" />}
                    </button>
                  </div>

                  {/* Número do cartão (pontos) */}
                  <div className="absolute left-5 right-5 top-[42%] flex items-center gap-2">
                    {[0, 1, 2, 3].map((g) => (
                      <div key={g} className="flex gap-0.75">
                        {[0, 1, 2, 3].map((d) => (
                          <span key={d} className="block h-1.25 w-1.25 rounded-full bg-white/55" />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Card name and date */}
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="truncate text-sm font-bold tracking-widest">{cartao.nome}</p>
                    <p className="mt-0.5 text-[10px] font-medium opacity-55">
                      desde {new Date(cartao.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
