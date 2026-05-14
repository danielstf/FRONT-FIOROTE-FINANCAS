import { useEffect, useState, type FormEvent } from "react";
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

export function CartoesPage() {
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
  }, []);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-7">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Cartões de crédito
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-normal text-card-foreground lg:text-4xl">
                Organize os cartões usados nas despesas.
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Cadastre os cartões da conta para vincular compras no crédito,
                parcelas e lançamentos futuros com mais clareza.
              </p>
            </div>
          </div>

          <Card className="self-start border-primary/20 bg-background/80 shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <WalletCards className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cartões cadastrados</p>
                <p className="mt-1 text-3xl font-semibold tracking-normal">
                  {cartoes.length}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border p-3 text-sm">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-muted-foreground">
                  Disponíveis no cadastro de despesas
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,520px)_1fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                {editando ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </span>
              <div>
                <CardTitle>{editando ? "Editar cartão" : "Novo cartão"}</CardTitle>
                <CardDescription>
                  Use nomes simples para reconhecer o cartão rapidamente.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={salvarCartao}>
              <div className="space-y-2">
                <Label htmlFor="nome-cartao">Nome do cartão</Label>
                <Input
                  id="nome-cartao"
                  value={nome}
                  onChange={(event) => setNome(toUppercaseText(event.target.value))}
                  placeholder="Ex: Nubank, Inter, Itaú"
                  required
                />
              </div>

              {error && (
                <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editando ? "Salvar alterações" : "Cadastrar cartão"}
                </Button>
                {editando && (
                  <Button type="button" variant="outline" onClick={cancelarEdicao}>
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Cartões cadastrados</CardTitle>
            <CardDescription>
              Estes cartões aparecem no seletor de despesas com cartão de crédito.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando cartões...
              </div>
            )}

            {!loading && cartoes.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-muted/35 p-8 text-center">
                <p className="font-medium text-foreground">Nenhum cartão cadastrado.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cadastre seu primeiro cartão para usar em despesas no crédito.
                </p>
              </div>
            )}

            {!loading && cartoes.length > 0 && (
              <div className="grid gap-3">
                {cartoes.map((cartao) => (
                  <div
                    key={cartao.id}
                    className="grid gap-3 rounded-lg border border-border bg-background p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-card sm:grid-cols-[1fr_auto]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <CreditCard className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                          {cartao.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Criado em {new Date(cartao.criadoEm).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        className="h-9 w-9 px-0"
                        title="Editar cartão"
                        variant="outline"
                        onClick={() => iniciarEdicao(cartao)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        className="h-9 w-9 px-0 text-destructive hover:text-destructive"
                        title="Excluir cartão"
                        variant="outline"
                        onClick={() => excluirCartao(cartao)}
                        disabled={busyId === cartao.id}
                      >
                        {busyId === cartao.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
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
