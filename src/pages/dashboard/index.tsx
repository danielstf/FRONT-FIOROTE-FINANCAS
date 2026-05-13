import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  CreditCard,
  Loader2,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";
import { dashboardApi } from "../../api/dashboard/dashboard-api";
import type { ResumoFinanceiroResponse } from "../../api/dashboard/types";
import { despesasApi } from "../../api/despesas/despesas-api";
import type { Despesa } from "../../api/despesas/types";
import { getApiErrorMessage } from "../../api/errors";
import { receitasApi } from "../../api/receitas/receitas-api";
import type { Receita } from "../../api/receitas/types";
import { MonthPicker } from "../../components/month-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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

  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

export function DashboardPage() {
  const { session } = useAuth();
  const [mes, setMes] = useState(getCurrentMonth);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [despesasPendentes, setDespesasPendentes] = useState<Despesa[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiroResponse | null>(null);
  const [loading, setLoading] = useState(true);
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
      description: `Entradas de ${formatMonthName(mes)}`,
      className: "text-blue-600 dark:text-blue-400",
      iconClassName: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Despesas",
      value: formatCurrency(totalDespesas),
      icon: ReceiptText,
      description: "Total cadastrado no mes",
      className: "text-red-600 dark:text-red-400",
      iconClassName: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
    {
      label: "Pendentes",
      value: formatCurrency(totalDespesasPendentes),
      icon: AlertTriangle,
      description: `${resumoMes?.contasVencidas ?? 0} contas vencidas`,
      className: "text-amber-600 dark:text-amber-400",
      iconClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Saldo",
      value: formatCurrency(saldo),
      icon: BadgeCheck,
      description: "Saldo final acumulado",
      className: saldoPositivo
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400",
      iconClassName: saldoPositivo
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : "bg-red-500/10 text-red-600 dark:text-red-400",
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

  useEffect(() => {
    void carregarDashboard(mes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm lg:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </span>
              <h1 className="text-3xl font-semibold tracking-normal text-card-foreground">
                Dashboard
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Ola, {session?.usuario.nome}. Resumo financeiro de{" "}
              <span className="capitalize">{formatMonthName(mes)}</span>.
            </p>
          </div>

          <div className="mx-auto w-full max-w-sm space-y-2 text-center">
            <Label className="justify-center">Mes de referencia</Label>
            <MonthPicker
              className="mx-auto"
              value={mes}
              onChange={(selectedMonth) => {
                setMes(selectedMonth);
                void carregarDashboard(selectedMonth);
              }}
            />
          </div>

          <div className="hidden lg:block" />
        </div>
      </section>

      {error && (
        <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card className="shadow-sm" key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md",
                  stat.iconClassName,
                )}
              >
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className={cn("text-2xl", stat.className)}>
                {stat.value}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Receitas do mes</CardTitle>
            <CardDescription>
              Entradas cadastradas em{" "}
              <span className="capitalize">{formatMonthName(mes)}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando dashboard...
              </div>
            )}

            {!loading && receitas.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-muted/35 p-6 text-center">
                <p className="font-medium text-foreground">
                  Nenhuma receita neste mes.
                </p>
              </div>
            )}

            {!loading && receitas.length > 0 && (
              <div className="grid gap-3">
                {receitas.slice(0, 5).map((receita) => (
                  <div
                    key={receita.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-4 shadow-sm"
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
                    <strong className="shrink-0 text-blue-600 dark:text-blue-400">
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
              Somente contas nao pagas de{" "}
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
                <p className="font-medium text-foreground">
                  Nenhuma despesa pendente neste mes.
                </p>
              </div>
            )}

            {!loading && despesasPendentes.length > 0 && (
              <div className="grid gap-3">
                {despesasPendentes.slice(0, 6).map((despesa) => (
                  <div
                    key={despesa.id}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-4 shadow-sm",
                      despesa.vencida && "border-destructive/35 bg-destructive/5",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-red-600 dark:text-red-400",
                          despesa.vencida &&
                            "bg-destructive/10 text-destructive",
                        )}
                      >
                        {despesa.vencida ? (
                          <AlertTriangle className="h-5 w-5" />
                        ) : (
                          <ReceiptText className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-red-600 dark:text-red-400">
                          {despesa.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(despesa.dataVencimento)}
                          {despesa.vencida ? " · Vencida" : ""}
                        </p>
                      </div>
                    </div>
                    <strong className="shrink-0 text-red-600 dark:text-red-400">
                      {formatCurrency(despesa.valor)}
                    </strong>
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
