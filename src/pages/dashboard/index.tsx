import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  ReceiptText,
  Sparkles,
  ThumbsUp,
  WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { dashboardApi } from "../../api/dashboard/dashboard-api";
import type { ResumoFinanceiroResponse } from "../../api/dashboard/types";
import { despesasApi } from "../../api/despesas/despesas-api";
import type { Despesa } from "../../api/despesas/types";
import { getApiErrorMessage } from "../../api/errors";
import { receitasApi } from "../../api/receitas/receitas-api";
import type { Receita } from "../../api/receitas/types";
import { MonthPicker } from "../../components/month-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { cn } from "../../lib/utils";
import { useAuth } from "../../providers/auth-provider";

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatMonthName(value: string) {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDate(value: string | null) {
  if (!value) return "Sem vencimento";

  const [datePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) return "Data inválida";

  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(year, month - 1, day),
  );
}

export function DashboardPage() {
  const { session } = useAuth();
  const [mes, setMes] = useState(getCurrentMonth);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [despesasPendentes, setDespesasPendentes] = useState<Despesa[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiroResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const resumoMes = resumo?.resumo;
  const totalReceitas = resumoMes?.totalReceitas ?? 0;
  const totalDespesas = resumoMes?.totalDespesas ?? 0;
  const totalDespesasPendentes = resumoMes?.totalDespesasPendentes ?? 0;
  const saldo = resumoMes?.saldoFinal ?? totalReceitas - totalDespesas;
  const saldoPositivo = saldo >= 0;

  const stats = [
    {
      label: "Receitas",
      value: formatCurrency(totalReceitas),
      icon: WalletCards,
      color: "text-blue-600 dark:text-blue-400",
      iconColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Despesas",
      value: formatCurrency(totalDespesas),
      icon: ReceiptText,
      color: "text-red-600 dark:text-red-400",
      iconColor: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
    {
      label: "Pendentes",
      value: formatCurrency(totalDespesasPendentes),
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      iconColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  async function carregarDashboard(mesSelecionado = mes) {
    setError("");
    setLoading(true);

    try {
      const [resumoResult, receitasResult, despesasResult] = await Promise.all([
        dashboardApi.resumoFinanceiro({ mes: mesSelecionado, meses: 6 }),
        receitasApi.listar({ mes: mesSelecionado }),
        despesasApi.listar({ mes: mesSelecionado, paga: false }),
      ]);

      setResumo(resumoResult);
      setReceitas(receitasResult.receitas);
      setDespesasPendentes(despesasResult.despesas);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function marcarComoPaga(despesa: Despesa) {
    setPayingId(despesa.id);

    try {
      await despesasApi.alterarPagamento(despesa.id, true);
      toast.success("Despesa marcada como paga.");
      await carregarDashboard(mes);
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setPayingId(null);
    }
  }

  useEffect(() => {
    void carregarDashboard(mes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-7">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="capitalize">{formatMonthName(mes)}</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-semibold tracking-normal text-card-foreground sm:text-3xl lg:text-4xl">
                Olá, {session?.usuario.nome}. Seu mês está{" "}
                <span className={saldoPositivo ? "text-emerald-600" : "text-red-600"}>
                  {saldoPositivo ? "positivo" : "negativo"}
                </span>
                .
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Acompanhe o saldo, veja entradas recentes e resolva suas pendências
                sem sair do dashboard.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <span className={cn("flex h-8 w-8 items-center justify-center rounded-md", stat.iconColor)}>
                      <stat.icon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className={cn("mt-2 text-xl font-semibold", stat.color)}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Card className="self-start border-primary/20 bg-background/80 shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo final</p>
                  <p
                    className={cn(
                      "mt-1 text-3xl font-semibold tracking-normal",
                      saldoPositivo
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {formatCurrency(saldo)}
                  </p>
                </div>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between rounded-md border border-border p-3">
                  <span className="text-muted-foreground">Vencidas</span>
                  <strong className="text-amber-600 dark:text-amber-400">
                    {resumoMes?.contasVencidas ?? 0}
                  </strong>
                </div>
                <div className="space-y-2">
                  <Label>Mês de referência</Label>
                  <MonthPicker
                    value={mes}
                    onChange={(selectedMonth) => {
                      setMes(selectedMonth);
                      void carregarDashboard(selectedMonth);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {error && (
        <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Receitas do mês</CardTitle>
            <CardDescription>
              Entradas cadastradas em{" "}
              <span className="capitalize">{formatMonthName(mes)}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando receitas...
              </div>
            )}

            {!loading && receitas.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-muted/35 p-6 text-center">
                <p className="font-medium text-foreground">Nenhuma receita neste mês.</p>
              </div>
            )}

            {!loading && receitas.length > 0 && (
              <div className="grid gap-3">
                {receitas.slice(0, 5).map((receita) => (
                  <div
                    key={receita.id}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <ArrowUpRight className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-blue-600 dark:text-blue-400">
                          {receita.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(receita.criadoEm).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <strong className="shrink-0 self-end text-blue-600 dark:text-blue-400 sm:self-auto">
                      {formatCurrency(receita.valor)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Despesas pendentes</CardTitle>
            <CardDescription>
              Todas as contas não pagas de{" "}
              <span className="capitalize">{formatMonthName(mes)}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando despesas...
              </div>
            )}

            {!loading && despesasPendentes.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-muted/35 p-6 text-center">
                <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />
                <p className="mt-2 font-medium text-foreground">
                  Nenhuma despesa pendente neste mês.
                </p>
              </div>
            )}

            {!loading && despesasPendentes.length > 0 && (
              <div className="grid max-h-[620px] gap-3 overflow-y-auto pr-1">
                {despesasPendentes.map((despesa) => (
                  <div
                    key={despesa.id}
                    className={cn(
                      "grid gap-3 rounded-lg border border-border bg-background p-4 shadow-sm sm:grid-cols-[1fr_auto]",
                      despesa.vencida && "border-destructive/35 bg-destructive/5",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-red-500/10 text-red-600 transition-colors hover:border-emerald-500/35 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-red-400",
                          despesa.vencida && "bg-destructive/10 text-destructive",
                        )}
                        title="Marcar como paga"
                        type="button"
                        onClick={() => marcarComoPaga(despesa)}
                        disabled={payingId === despesa.id}
                      >
                        {payingId === despesa.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ThumbsUp className="h-4 w-4" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-red-600 dark:text-red-400">
                          {despesa.nome}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(despesa.dataVencimento)}
                          </span>
                          {despesa.vencida && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-destructive/25 bg-destructive/10 px-2 py-0.5 font-medium text-destructive">
                              <AlertTriangle className="h-3 w-3" />
                              Vencida
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <strong className="shrink-0 text-red-600 dark:text-red-400">
                        {formatCurrency(despesa.valor)}
                      </strong>
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


