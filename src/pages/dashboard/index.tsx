import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  ReceiptText,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
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
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

function formatDate(value: string | null) {
  if (!value) return "Sem vencimento";
  const [datePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return "Data inválida";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(year, month - 1, day));
}

export function DashboardPage() {
  const { session, perfilFinanceiroId } = useAuth();
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
  const saldoProjetado = resumoMes?.saldoProjetado;
  const temPrevisaoDiferente = saldoProjetado !== undefined && saldoProjetado !== saldo;
  const saldoPositivo = saldo >= 0;

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
      await despesasApi.alterarPagamento(despesa.id, true, mes);
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
  }, [perfilFinanceiroId]);

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Olá, {session?.usuario.nome} 👋
          </h1>
          <p className="text-sm text-muted-foreground capitalize">
            {formatMonthName(mes)}
          </p>
        </div>
        <div className="w-full max-w-52 shrink-0">
          <MonthPicker
            value={mes}
            onChange={(selectedMonth) => {
              setMes(selectedMonth);
              void carregarDashboard(selectedMonth);
            }}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {/* Saldo */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border p-5 sm:col-span-2 xl:col-span-1",
            saldoPositivo
              ? "border-emerald-500/20 bg-emerald-500/6"
              : "border-red-500/20 bg-red-500/6",
          )}
        >
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full blur-2xl",
              saldoPositivo ? "bg-emerald-500/20" : "bg-red-500/20",
            )}
          />
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Saldo real
          </p>
          <p
            className={cn(
              "mt-2 text-3xl font-bold tracking-tight",
              saldoPositivo ? "text-emerald-500" : "text-red-500",
            )}
          >
            {loading ? "—" : formatCurrency(saldo)}
          </p>
          {!loading && temPrevisaoDiferente && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Previsto:{" "}
              <span className="font-semibold">
                {formatCurrency(saldoProjetado!)}
              </span>
            </p>
          )}
          <div className="mt-3 flex items-center gap-1.5">
            {saldoPositivo ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={cn("text-xs font-medium", saldoPositivo ? "text-emerald-500" : "text-red-500")}>
              {saldoPositivo ? "Mês positivo" : "Mês negativo"}
            </span>
          </div>

          {(resumoMes?.contasVencidas ?? 0) > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-destructive/25 bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">
              <AlertTriangle className="h-3 w-3" />
              {resumoMes?.contasVencidas} vencida(s)
            </div>
          )}
        </div>

        {/* Receitas */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-20 w-20 -translate-y-4 translate-x-4 rounded-full bg-blue-500/10 blur-2xl"
          />
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <WalletCards className="h-4 w-4" />
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-blue-500/60" />
          </div>
          <p className="mt-3 text-xs font-medium text-muted-foreground">Receitas</p>
          <p className="mt-1 text-2xl font-bold text-blue-500">
            {loading ? "—" : formatCurrency(totalReceitas)}
          </p>
        </div>

        {/* Despesas */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-20 w-20 -translate-y-4 translate-x-4 rounded-full bg-red-500/10 blur-2xl"
          />
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <ReceiptText className="h-4 w-4" />
            </div>
            <TrendingDown className="h-3.5 w-3.5 text-red-500/60" />
          </div>
          <p className="mt-3 text-xs font-medium text-muted-foreground">Despesas</p>
          <p className="mt-1 text-2xl font-bold text-red-500">
            {loading ? "—" : formatCurrency(totalDespesas)}
          </p>
        </div>

        {/* Pendentes */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-20 w-20 -translate-y-4 translate-x-4 rounded-full bg-amber-500/10 blur-2xl"
          />
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <CreditCard className="h-3.5 w-3.5 text-amber-500/60" />
          </div>
          <p className="mt-3 text-xs font-medium text-muted-foreground">Pendentes</p>
          <p className="mt-1 text-2xl font-bold text-amber-500">
            {loading ? "—" : formatCurrency(totalDespesasPendentes)}
          </p>
        </div>
      </div>

      {/* ── Lists ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Receitas do mês */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Receitas do mês</h2>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">
                Entradas de {formatMonthName(mes)}
              </p>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <WalletCards className="h-3.5 w-3.5" />
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2.5 p-5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando...
            </div>
          )}

          {!loading && receitas.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2.5 py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <WalletCards className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhuma receita neste mês.</p>
            </div>
          )}

          {!loading && receitas.length > 0 && (
            <div className="divide-y divide-border/60">
              {receitas.slice(0, 5).map((receita) => (
                <div
                  key={receita.id}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {receita.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(receita.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-blue-500">
                    {formatCurrency(receita.valor)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Despesas pendentes */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Despesas pendentes</h2>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">
                Contas em aberto de {formatMonthName(mes)}
              </p>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <ReceiptText className="h-3.5 w-3.5" />
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2.5 p-5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando...
            </div>
          )}

          {!loading && despesasPendentes.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2.5 py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              </div>
              <p className="text-sm text-muted-foreground">Tudo em dia! Nenhuma pendência.</p>
            </div>
          )}

          {!loading && despesasPendentes.length > 0 && (
            <div className="divide-y divide-border/60 max-h-130 overflow-y-auto">
              {despesasPendentes.map((despesa) => (
                <div
                  key={despesa.id}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30",
                    despesa.vencida && "bg-destructive/4 hover:bg-destructive/7",
                  )}
                >
                  <button
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all",
                      despesa.vencida
                        ? "border-destructive/30 bg-destructive/10 text-destructive hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500"
                        : "border-red-500/20 bg-red-500/10 text-red-500 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500",
                    )}
                    title="Marcar como paga"
                    type="button"
                    onClick={() => marcarComoPaga(despesa)}
                    disabled={payingId === despesa.id}
                  >
                    {payingId === despesa.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ThumbsUp className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {despesa.nome}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(despesa.dataVencimento)}
                      </span>
                      {despesa.vencida && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Vencida
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-red-500">
                    {formatCurrency(despesa.valor)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
