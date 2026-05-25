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
            <div className="divide-y divide-border/60">
              {cartoes.map((cartao) => (
                <div
                  key={cartao.id}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{cartao.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      Criado em {new Date(cartao.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button
                      className="h-8 w-8 rounded-lg px-0"
                      variant="outline"
                      title="Editar"
                      onClick={() => iniciarEdicao(cartao)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      className="h-8 w-8 rounded-lg px-0 text-destructive hover:text-destructive"
                      variant="outline"
                      title="Excluir"
                      disabled={busyId === cartao.id}
                      onClick={() => excluirCartao(cartao)}
                    >
                      {busyId === cartao.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
