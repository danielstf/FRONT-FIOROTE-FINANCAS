import {
  BadgeCheck,
  CreditCard,
  Loader2,
  Pencil,
  Plus,
  Save,
  Sparkles,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
      setCartoes(
        data.cartoes.map((cartao) => ({
          ...cartao,
          nome: toUppercaseText(cartao.nome),
        })),
      );
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

      if (!nomeNormalizado) {
        toast.error("Informe o nome do cartão.");
        return;
      }

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
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-7">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Cartões de crédito
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-card-foreground lg:text-3xl">
                Organize seus cartões
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                Cadastre os cartões da conta para vincular compras no crédito,
                parcelas e lançamentos futuros com mais clareza.
              </p>
            </div>
          </div>

          <Card className="self-start border-primary/20 bg-background shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <WalletCards className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Cartões cadastrados
                  </p>
                  <p className="mt-0.5 text-3xl font-bold tracking-tight">
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      cartoes.length
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
                <BadgeCheck className="h-4 w-4 shrink-0" />
                Disponíveis no cadastro de despesas
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,480px)_1fr]">
        {/* Formulário */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {editando ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
              <div>
                <CardTitle className="text-sm font-semibold uppercase tracking-wide">
                  {editando ? "Editar cartão" : "Novo cartão"}
                </CardTitle>
                <CardDescription className="text-xs">
                  Use nomes simples para reconhecer rapidamente.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <form className="grid gap-4" onSubmit={salvarCartao}>
              <div className="space-y-2">
                <Label htmlFor="nome-cartao" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Nome do cartão
                </Label>
                <Input
                  id="nome-cartao"
                  value={nome}
                  onChange={(event) => setNome(toUppercaseText(event.target.value))}
                  placeholder="Ex: NUBANK, INTER, ITAÚ"
                  required
                  className="h-10"
                />
              </div>

              {error && (
                <p className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="submit" disabled={saving} className="h-10 flex-1 gap-2">
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editando ? "Salvar alterações" : "Cadastrar cartão"}
                </Button>
                {editando && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelarEdicao}
                    className="h-10 gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de cartões */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide">
              Cartões cadastrados
            </CardTitle>
            <CardDescription className="text-xs">
              Estes cartões aparecem no seletor de despesas com cartão de crédito.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading && (
              <div className="flex items-center gap-2 p-5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando cartões...
              </div>
            )}

            {!loading && cartoes.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Nenhum cartão cadastrado.</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cadastre seu primeiro cartão para usar em despesas.
                  </p>
                </div>
              </div>
            )}

            {!loading && cartoes.length > 0 && (
              <div className="divide-y divide-border">
                {cartoes.map((cartao) => (
                  <div
                    key={cartao.id}
                    className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <CreditCard className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {cartao.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Criado em {new Date(cartao.criadoEm).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 justify-end gap-2">
                      <Button
                        className="h-8 w-8 rounded-lg p-0"
                        title="Editar cartão"
                        variant="outline"
                        onClick={() => iniciarEdicao(cartao)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        className="h-8 w-8 rounded-lg p-0 text-destructive hover:text-destructive"
                        title="Excluir cartão"
                        variant="outline"
                        onClick={() => excluirCartao(cartao)}
                        disabled={busyId === cartao.id}
                      >
                        {busyId === cartao.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

