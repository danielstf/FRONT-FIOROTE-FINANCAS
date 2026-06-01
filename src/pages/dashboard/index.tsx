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
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { toast } from "sonner";
import { dashboardApi } from "../../api/dashboard/dashboard-api";
import type { ResumoFinanceiroResponse } from "../../api/dashboard/types";
import { despesasApi } from "../../api/despesas/despesas-api";
import type { Despesa } from "../../api/despesas/types";
import { getApiErrorMessage } from "../../api/errors";
import { receitasApi } from "../../api/receitas/receitas-api";
import type { Receita } from "../../api/receitas/types";
import { formatCurrency, formatDate, formatMonthName, getCurrentMonth } from "../../lib/format";
import { MonthPicker } from "../../components/month-picker";
import { cn } from "../../lib/utils";
import { useAuth } from "../../providers/auth-provider";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Bom dia", emoji: "🌤️" };
  if (h < 18) return { text: "Boa tarde", emoji: "☀️" };
  return { text: "Boa noite", emoji: "🌙" };
}

function useCountUp(target: number, enabled: boolean, duration = 700) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    setValue(0);
    const start = performance.now();
    function step(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - (1 - t) ** 3;
      setValue(target * ease);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, enabled, duration]);

  return value;
}

const statsContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVar = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const listVar = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.055, delayChildren: 0.1 } },
};

const itemVar: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.28 } },
};

function SkeletonCard({ wide = false }: { wide?: boolean }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 animate-pulse", wide && "sm:col-span-2 xl:col-span-1")}>
      <div className="h-3 w-20 rounded-full bg-muted mb-4" />
      <div className="h-7 w-32 rounded-full bg-muted mb-3" />
      <div className="h-2.5 w-16 rounded-full bg-muted" />
    </div>
  );
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
  const saldo = totalReceitas - totalDespesas;
  const saldoProjetado = resumoMes?.saldoProjetado;
  const temPrevisaoDiferente = saldoProjetado !== undefined && Math.abs(saldoProjetado - saldo) > 0.01;
  const saldoPositivo = saldo >= 0;
  const ratio = totalReceitas > 0 ? Math.min((totalDespesas / totalReceitas) * 100, 100) : 0;

  const saldoAnim = useCountUp(Math.abs(saldo), !loading);
  const receitasAnim = useCountUp(totalReceitas, !loading);
  const despesasAnim = useCountUp(totalDespesas, !loading);
  const pendentesAnim = useCountUp(totalDespesasPendentes, !loading);

  const greeting = getGreeting();

  async function carregarDashboard(mesSelecionado = mes) {
    setError("");
    setLoading(true);
    try {
      const [resumoResult, receitasResult, despesasResult] = await Promise.all([
        dashboardApi.resumoFinanceiro({ mes: mesSelecionado, meses: 6 }),
        receitasApi.listar({ mes: mesSelecionado }),
        despesasApi.listar({ mes: mesSelecionado }),
      ]);
      setResumo(resumoResult);
      setReceitas(receitasResult.receitas);
      setDespesasPendentes(despesasResult.despesas.filter((d) => !d.paga));
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
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        {/* Linha decorativa acima do header */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-4 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent"
        />
        <div className="space-y-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {greeting.text}, {session?.usuario.nome.split(" ")[0]} {greeting.emoji}
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
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Stats ── */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SkeletonCard wide />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <motion.div
          variants={statsContainer}
          initial="hidden"
          animate="show"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {/* Saldo */}
          <motion.div
            variants={cardVar}
            whileHover={{ y: -3, transition: { duration: 0.18 } }}
            className={cn(
              "relative overflow-hidden rounded-2xl border p-5 sm:col-span-2 xl:col-span-1 cursor-default",
              saldoPositivo
                ? "border-emerald-500/25 bg-emerald-500/6"
                : "border-red-500/25 bg-red-500/6",
            )}
          >
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full blur-3xl",
                saldoPositivo ? "bg-emerald-500/25" : "bg-red-500/25",
              )}
            />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Saldo real
            </p>
            <p className={cn("mt-2 text-3xl font-bold tabular-nums tracking-tight", saldoPositivo ? "text-emerald-500" : "text-red-500")}>
              {saldo < 0 ? "−" : ""}{formatCurrency(saldoAnim)}
            </p>
            {temPrevisaoDiferente && (
              <p className="mt-1 text-xs text-muted-foreground">
                Previsto: <span className="font-semibold">{formatCurrency(saldoProjetado!)}</span>
              </p>
            )}

            {/* Ratio bar */}
            {totalReceitas > 0 && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Comprometido</span>
                  <span>{Math.round(ratio)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <motion.div
                    className={cn("h-full rounded-full", ratio > 90 ? "bg-red-500" : ratio > 70 ? "bg-amber-400" : "bg-emerald-500")}
                    initial={{ width: 0 }}
                    animate={{ width: `${ratio}%` }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}
                  />
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center gap-1.5">
              {saldoPositivo
                ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
              <span className={cn("text-xs font-medium", saldoPositivo ? "text-emerald-500" : "text-red-500")}>
                {saldoPositivo ? "Mês positivo" : "Mês negativo"}
              </span>
            </div>

            {(resumoMes?.contasVencidas ?? 0) > 0 && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-destructive/25 bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">
                <AlertTriangle className="h-3 w-3" />
                {resumoMes?.contasVencidas} vencida(s)
              </div>
            )}
          </motion.div>

          {/* Receitas */}
          <motion.div
            variants={cardVar}
            whileHover={{ y: -3, transition: { duration: 0.18 } }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 cursor-default"
          >
            <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-blue-500/12 blur-2xl" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <WalletCards className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-blue-400/50" />
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Receitas</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-blue-500">
              {formatCurrency(receitasAnim)}
            </p>
          </motion.div>

          {/* Despesas */}
          <motion.div
            variants={cardVar}
            whileHover={{ y: -3, transition: { duration: 0.18 } }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 cursor-default"
          >
            <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-red-500/12 blur-2xl" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <ReceiptText className="h-4 w-4" />
              </div>
              <TrendingDown className="h-3.5 w-3.5 text-red-400/50" />
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Despesas</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-red-500">
              {formatCurrency(despesasAnim)}
            </p>
          </motion.div>

          {/* Pendentes */}
          <motion.div
            variants={cardVar}
            whileHover={{ y: -3, transition: { duration: 0.18 } }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 cursor-default"
          >
            <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-amber-500/12 blur-2xl" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <CreditCard className="h-3.5 w-3.5 text-amber-400/50" />
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Pendentes</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-amber-500">
              {formatCurrency(pendentesAnim)}
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* ── Lists ── */}
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Receitas do mês */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.18 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card"
        >
          {/* Linha de destaque no topo */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-blue-500/40 to-transparent" />
          {/* Glow interno sutil */}
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/6 blur-2xl" />

          <div className="relative flex items-center justify-between gap-3 border-b border-border px-5 py-4">
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
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
            </div>
          )}

          {!loading && receitas.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-2.5 py-12 text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <WalletCards className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhuma receita neste mês.</p>
            </motion.div>
          )}

          {!loading && receitas.length > 0 && (
            <motion.div variants={listVar} initial="hidden" animate="show" className="divide-y divide-border/60">
              {receitas.slice(0, 5).map((receita) => (
                <motion.div
                  key={receita.id}
                  variants={itemVar}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{receita.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(receita.criadoEm)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-blue-500">
                    {formatCurrency(receita.valor)}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Despesas pendentes */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.24 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card"
        >
          {/* Linha de destaque no topo */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-red-500/40 to-transparent" />
          {/* Glow interno sutil */}
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/6 blur-2xl" />

          <div className="relative flex items-center justify-between gap-3 border-b border-border px-5 py-4">
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
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
            </div>
          )}

          {!loading && despesasPendentes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-2.5 py-12 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10"
              >
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Tudo em dia! Nenhuma pendência.</p>
            </motion.div>
          )}

          {!loading && despesasPendentes.length > 0 && (
            <motion.div
              variants={listVar}
              initial="hidden"
              animate="show"
              className="divide-y divide-border/60 max-h-130 overflow-y-auto"
            >
              <AnimatePresence>
                {despesasPendentes.map((despesa) => (
                  <motion.div
                    key={despesa.id}
                    variants={itemVar}
                    exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                    className={cn(
                      "flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30",
                      despesa.vencida && "bg-destructive/4 hover:bg-destructive/7",
                    )}
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.92 }}
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
                      {payingId === despesa.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <ThumbsUp className="h-3.5 w-3.5" />}
                    </motion.button>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{despesa.nome}</p>
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
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
