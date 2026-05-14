import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../api/errors";
import { receitasApi } from "../../api/receitas/receitas-api";
import type { Receita } from "../../api/receitas/types";
import { MonthPicker } from "../../components/month-picker";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { ReceitaForm } from "./receita-form";

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatMonth(value: string) {
  const [year, month] = value.split("-");
  return `${month}/${year}`;
}

function formatMonthName(value: string) {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getMonthOnlyName(value: string) {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
  }).format(date);
}

export function ReceitasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMonth = searchParams.get("mes") ?? getCurrentMonth();
  const [mes, setMes] = useState(initialMonth);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cadastroAberto, setCadastroAberto] = useState(false);
  const [receitaEditando, setReceitaEditando] = useState<Receita | null>(null);
  const [receitaExcluindo, setReceitaExcluindo] = useState<Receita | null>(null);
  const [error, setError] = useState("");

  const maiorReceita = useMemo(() => {
    return receitas.reduce<Receita | null>((maior, receita) => {
      if (!maior || receita.valor > maior.valor) return receita;
      return maior;
    }, null);
  }, [receitas]);

  async function carregarReceitas(mesSelecionado = mes) {
    setError("");
    setLoading(true);

    try {
      const data = await receitasApi.listar({ mes: mesSelecionado });
      setReceitas(data.receitas);
      setTotal(data.total);
      setSearchParams({ mes: mesSelecionado });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function excluirReceita() {
    if (!receitaExcluindo) return;
    setError("");
    setDeletingId(receitaExcluindo.id);

    try {
      await receitasApi.excluir(receitaExcluindo.id);
      toast.success("Receita excluída com sucesso.");
      setReceitaExcluindo(null);
      await carregarReceitas(mes);
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    void carregarReceitas(initialMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_360px] lg:p-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <TrendingUp className="h-6 w-6" />
                </span>
                <h1 className="text-3xl font-semibold tracking-normal text-card-foreground">
                  Receitas
                </h1>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Acompanhe suas entradas por mês, edite lançamentos e mantenha o
                total mensal sempre limpo.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="space-y-2">
                <Label>Mês de referência</Label>
                <MonthPicker
                  value={mes}
                  onChange={(selectedMonth) => {
                    setMes(selectedMonth);
                    void carregarReceitas(selectedMonth);
                  }}
                />
              </div>
              <Button onClick={() => setCadastroAberto(true)}>
                <Plus className="h-4 w-4" />
                Nova receita
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
            <p className="text-sm capitalize text-muted-foreground">
              Total de {formatMonthName(mes)}
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-normal text-blue-600 dark:text-blue-400">
              {formatCurrency(total)}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-border bg-card p-3">
                <p className="text-muted-foreground">Lançamentos</p>
                <p className="mt-1 text-xl font-semibold text-blue-600 dark:text-blue-400">
                  {receitas.length}
                </p>
              </div>
              <div className="rounded-md border border-border bg-card p-3">
                <p className="text-muted-foreground">Maior receita</p>
                <p className="mt-1 truncate text-xl font-semibold text-blue-600 dark:text-blue-400">
                  {maiorReceita ? formatCurrency(maiorReceita.valor) : "R$ 0,00"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ArrowUpRight className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="capitalize">
                Entradas de {getMonthOnlyName(mes)}
              </CardTitle>
              <CardDescription>
                Gerencie as receitas cadastradas em {formatMonthName(mes)}.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando receitas...
            </div>
          )}

          {!loading && receitas.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/35 p-8 text-center">
              <p className="font-medium text-foreground">
                Nenhuma receita cadastrada para este mês.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Comece adicionando uma entrada para compor o total mensal.
              </p>
              <Button className="mt-4" onClick={() => setCadastroAberto(true)}>
                <Plus className="h-4 w-4" />
                Cadastrar receita
              </Button>
            </div>
          )}

          {!loading && receitas.length > 0 && (
            <div className="grid gap-3">
              {receitas.map((receita) => (
                <div
                  key={receita.id}
                  className="group grid gap-4 rounded-lg border border-border bg-background p-4 shadow-sm transition-colors hover:border-blue-500/35 hover:bg-card sm:grid-cols-[1fr_auto]"
                >
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-blue-600 dark:text-blue-400">
                        {receita.nome}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatMonth(receita.mes)}
                        </span>
                        <span>
                          Criada em{" "}
                          {new Date(receita.criadoEm).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <strong className="text-lg text-blue-600 dark:text-blue-400">
                      {formatCurrency(receita.valor)}
                    </strong>
                    <div className="flex gap-2">
                      <Button
                        className="h-9 w-9 px-0"
                        title="Editar receita"
                        variant="outline"
                        onClick={() => setReceitaEditando(receita)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        className="h-9 w-9 px-0 text-destructive hover:text-destructive"
                        title="Excluir receita"
                        variant="outline"
                        onClick={() => setReceitaExcluindo(receita)}
                        disabled={deletingId === receita.id}
                      >
                        {deletingId === receita.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={cadastroAberto} onOpenChange={setCadastroAberto}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Nova receita</DialogTitle>
            <DialogDescription>
              Cadastre uma entrada sem sair da lista de receitas.
            </DialogDescription>
          </DialogHeader>
          <ReceitaForm
            defaultMonth={mes}
            onCancel={() => setCadastroAberto(false)}
            onSuccess={(mesCriado) => {
              setCadastroAberto(false);
              setMes(mesCriado);
              void carregarReceitas(mesCriado);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(receitaEditando)}
        onOpenChange={(open) => {
          if (!open) setReceitaEditando(null);
        }}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Editar receita</DialogTitle>
            <DialogDescription>
              Atualize esta entrada sem sair da lista.
            </DialogDescription>
          </DialogHeader>
          {receitaEditando && (
            <ReceitaForm
              key={receitaEditando.id}
              mode="edit"
              receita={receitaEditando}
              onCancel={() => setReceitaEditando(null)}
              onSuccess={(mesEditado) => {
                setReceitaEditando(null);
                setMes(mesEditado);
                void carregarReceitas(mesEditado);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(receitaExcluindo)}
        onOpenChange={(open) => {
          if (!open) setReceitaExcluindo(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir receita</DialogTitle>
            <DialogDescription>
              Esta ação remove a receita selecionada definitivamente.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted/35 p-4 text-sm">
            <p className="font-medium text-foreground">{receitaExcluindo?.nome}</p>
            <p className="mt-1 text-blue-600 dark:text-blue-400">
              {formatCurrency(receitaExcluindo?.valor ?? 0)}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReceitaExcluindo(null)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90"
              type="button"
              onClick={excluirReceita}
              disabled={deletingId === receitaExcluindo?.id}
            >
              {deletingId === receitaExcluindo?.id && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
