import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CreditCard,
  Loader2,
  Pencil,
  Plus,
  ReceiptText,
  Repeat2,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { despesasApi } from "../../api/despesas/despesas-api";
import type { Despesa, FormaPagamentoDespesa } from "../../api/despesas/types";
import { getApiErrorMessage } from "../../api/errors";
import { MonthPicker } from "../../components/month-picker";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { cn } from "../../lib/utils";
import { DespesaForm } from "./despesa-form";
import { getCategoryIcon } from "./category-icons";
import {
  formaPagamentoLabel,
  formatCurrency,
  formatDate,
  formatMonthName,
  getCurrentMonth,
} from "./utils";

type StatusFilter = "todas" | "pendentes" | "pagas" | "vencidas";

export function DespesasPage() {
  const [mes, setMes] = useState(getCurrentMonth);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPendente, setTotalPendente] = useState(0);
  const [totalPago, setTotalPago] = useState(0);
  const [contasVencidas, setContasVencidas] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoDespesa | "">("");
  const [status, setStatus] = useState<StatusFilter>("todas");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cadastroAberto, setCadastroAberto] = useState(false);
  const [despesaEditando, setDespesaEditando] = useState<Despesa | null>(null);
  const [despesaExcluindo, setDespesaExcluindo] = useState<Despesa | null>(null);
  const [error, setError] = useState("");

  const maiorDespesa = useMemo(() => {
    return despesas.reduce<Despesa | null>((maior, despesa) => {
      if (!maior || despesa.valor > maior.valor) return despesa;
      return maior;
    }, null);
  }, [despesas]);

  async function carregarDespesas(
    mesSelecionado = mes,
    formaSelecionada = formaPagamento,
    statusSelecionado = status,
  ) {
    setError("");
    setLoading(true);

    try {
      const data = await despesasApi.listar({
        mes: mesSelecionado,
        formaPagamento: formaSelecionada || undefined,
        paga:
          statusSelecionado === "pagas"
            ? true
            : statusSelecionado === "pendentes"
              ? false
              : undefined,
        somenteVencidas: statusSelecionado === "vencidas" || undefined,
      });

      setDespesas(data.despesas);
      setTotal(data.total);
      setTotalPendente(data.totalPendente);
      setTotalPago(data.totalPago);
      setContasVencidas(data.contasVencidas);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function alternarPagamento(despesa: Despesa) {
    setBusyId(despesa.id);
    setError("");

    try {
      await despesasApi.alterarPagamento(despesa.id, !despesa.paga);
      await carregarDespesas();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  }

  async function excluirDespesa() {
    if (!despesaExcluindo) return;
    setBusyId(despesaExcluindo.id);
    setError("");

    try {
      await despesasApi.excluir(despesaExcluindo.id);
      setDespesaExcluindo(null);
      await carregarDespesas();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    void carregarDespesas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="grid gap-6 p-5 lg:grid-cols-[1fr_380px] lg:p-6">
          <div className="space-y-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                    <ReceiptText className="h-5 w-5" />
                  </span>
                  <h1 className="text-3xl font-semibold tracking-normal text-card-foreground">
                    Despesas
                  </h1>
                </div>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Acompanhe contas, vencimentos, formas de pagamento e parcelas de{" "}
                  <span className="capitalize">{formatMonthName(mes)}</span>.
                </p>
              </div>
              <Button className="sm:mt-1" onClick={() => setCadastroAberto(true)}>
                <Plus className="h-4 w-4" />
                Nova despesa
              </Button>
            </div>

            <div className="grid gap-3 rounded-lg border border-border bg-muted/35 p-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Mes</Label>
                <MonthPicker
                  value={mes}
                  onChange={(value) => {
                    setMes(value);
                    void carregarDespesas(value, formaPagamento, status);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="forma-despesa">Forma</Label>
                <Select
                  id="forma-despesa"
                  value={formaPagamento}
                  onChange={(event) => {
                    const value = event.target.value as FormaPagamentoDespesa | "";
                    setFormaPagamento(value);
                    void carregarDespesas(mes, value, status);
                  }}
                >
                  <option value="">Todas</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="CARTAO_CREDITO">Cartao de credito</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-despesa">Status</Label>
                <Select
                  id="status-despesa"
                  value={status}
                  onChange={(event) => {
                    const value = event.target.value as StatusFilter;
                    setStatus(value);
                    void carregarDespesas(mes, formaPagamento, value);
                  }}
                >
                  <option value="todas">Todas</option>
                  <option value="pendentes">Pendentes</option>
                  <option value="pagas">Pagas</option>
                  <option value="vencidas">Vencidas</option>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span className="capitalize">Total de {formatMonthName(mes)}</span>
            </div>
            <p className="mt-3 text-4xl font-semibold tracking-normal text-red-600 dark:text-red-400">
              {formatCurrency(total)}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-border bg-card p-3">
                <p className="text-muted-foreground">Pendentes</p>
                <p className="mt-1 text-xl font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(totalPendente)}
                </p>
              </div>
              <div className="rounded-md border border-border bg-card p-3">
                <p className="text-muted-foreground">Pagas</p>
                <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalPago)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>Contas vencidas</CardDescription>
              <CardTitle className="text-red-600 dark:text-red-400">
                {contasVencidas}
              </CardTitle>
            </div>
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>Maior despesa</CardDescription>
              <CardTitle className="text-red-600 dark:text-red-400">
                {maiorDespesa ? formatCurrency(maiorDespesa.valor) : "R$ 0,00"}
              </CardTitle>
            </div>
            <ReceiptText className="h-5 w-5 text-red-600 dark:text-red-400" />
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>Lancamentos</CardDescription>
              <CardTitle className="text-red-600 dark:text-red-400">
                {despesas.length}
              </CardTitle>
            </div>
            <CreditCard className="h-5 w-5 text-red-600 dark:text-red-400" />
          </CardHeader>
        </Card>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <ReceiptText className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>Contas cadastradas</CardTitle>
              <CardDescription>
                Categorias com icones, recorrencia, parcelas e controle de pagamento.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando despesas...
            </div>
          )}

          {!loading && despesas.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/35 p-8 text-center">
              <p className="font-medium text-foreground">Nenhuma despesa encontrada.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre uma conta para iniciar o controle do mes.
              </p>
              <Button className="mt-4" onClick={() => setCadastroAberto(true)}>
                <Plus className="h-4 w-4" />
                Cadastrar despesa
              </Button>
            </div>
          )}

          {!loading && despesas.length > 0 && (
            <div className="grid gap-3">
              {despesas.map((despesa) => {
                const CategoryIcon = getCategoryIcon(despesa.categoria);

                return (
                  <div
                    key={despesa.id}
                    className={cn(
                      "grid gap-4 rounded-lg border border-border bg-background p-4 shadow-sm transition-colors hover:border-destructive/35 hover:bg-card sm:grid-cols-[1fr_auto]",
                      despesa.paga && "border-emerald-500/25",
                      despesa.vencida && !despesa.paga && "border-destructive/35 bg-destructive/5",
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                        {despesa.vencida && !despesa.paga ? (
                          <AlertTriangle className="h-5 w-5" />
                        ) : (
                          <CategoryIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-red-600 dark:text-red-400">
                            {despesa.nome}
                          </p>
                          {despesa.paga && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                              <ThumbsUp className="h-3 w-3 fill-current" />
                              Paga
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1">
                            <CategoryIcon className="h-3.5 w-3.5" />
                            {despesa.categoria ?? "Sem categoria"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1">
                            <CreditCard className="h-3.5 w-3.5" />
                            {despesa.cartaoCredito
                              ? despesa.cartaoCredito.nome
                              : formaPagamentoLabel[despesa.formaPagamento]}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(despesa.dataVencimento)}
                          </span>
                          {despesa.fixa && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-primary">
                              <Repeat2 className="h-3.5 w-3.5" />
                              Fixa
                            </span>
                          )}
                          {despesa.parcelaAtual && despesa.numeroParcelas && (
                            <span className="rounded-md border border-border bg-card px-2 py-1">
                              Parcela {despesa.parcelaAtual}/{despesa.numeroParcelas}
                            </span>
                          )}
                          {despesa.vencida && !despesa.paga && (
                            <span className="rounded-md border border-destructive/25 bg-destructive/10 px-2 py-1 font-medium text-destructive">
                              Vencida
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <div className="text-right">
                        <strong className="text-lg text-red-600 dark:text-red-400">
                          {formatCurrency(despesa.valor)}
                        </strong>
                        <p className="text-xs text-muted-foreground">
                          {despesa.paga ? "Quitada" : "Pendente"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          aria-label={
                            despesa.paga
                              ? "Despesa paga"
                              : "Marcar despesa como paga"
                          }
                          className={cn(
                            "h-9 w-9 px-0",
                            despesa.paga
                              ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 hover:text-emerald-800 dark:text-emerald-400"
                              : "text-muted-foreground hover:text-emerald-700",
                          )}
                          title={despesa.paga ? "Despesa paga" : "Marcar como paga"}
                          variant="outline"
                          onClick={() => alternarPagamento(despesa)}
                          disabled={busyId === despesa.id}
                        >
                          {busyId === despesa.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : despesa.paga ? (
                            <ThumbsUp className="h-4 w-4 fill-current" />
                          ) : (
                            <ThumbsUp className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          aria-label="Editar despesa"
                          className="h-9 w-9 px-0"
                          title="Editar"
                          variant="outline"
                          onClick={() => setDespesaEditando(despesa)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          aria-label="Excluir despesa"
                          className="h-9 w-9 px-0 text-destructive hover:text-destructive"
                          title="Excluir"
                          variant="outline"
                          onClick={() => setDespesaExcluindo(despesa)}
                          disabled={busyId === despesa.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={cadastroAberto} onOpenChange={setCadastroAberto}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>Nova despesa</DialogTitle>
            <DialogDescription>
              Cadastre uma conta sem sair da lista de despesas.
            </DialogDescription>
          </DialogHeader>
          <DespesaForm
            mode="create"
            defaultMonth={mes}
            onCancel={() => setCadastroAberto(false)}
            onSuccess={() => {
              setCadastroAberto(false);
              void carregarDespesas();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(despesaEditando)}
        onOpenChange={(open) => {
          if (!open) setDespesaEditando(null);
        }}
      >
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>Editar despesa</DialogTitle>
            <DialogDescription>
              Atualize a conta sem sair da lista de despesas.
            </DialogDescription>
          </DialogHeader>
          {despesaEditando && (
            <DespesaForm
              key={despesaEditando.id}
              mode="edit"
              despesa={despesaEditando}
              onCancel={() => setDespesaEditando(null)}
              onSuccess={() => {
                setDespesaEditando(null);
                void carregarDespesas();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(despesaExcluindo)}
        onOpenChange={(open) => {
          if (!open) setDespesaExcluindo(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir despesa</DialogTitle>
            <DialogDescription>
              Esta acao remove a despesa selecionada definitivamente.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted/35 p-4 text-sm">
            <p className="font-medium text-foreground">{despesaExcluindo?.nome}</p>
            <p className="mt-1 text-red-600 dark:text-red-400">
              {formatCurrency(despesaExcluindo?.valor ?? 0)}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDespesaExcluindo(null)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90"
              type="button"
              onClick={excluirDespesa}
              disabled={busyId === despesaExcluindo?.id}
            >
              {busyId === despesaExcluindo?.id && (
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
